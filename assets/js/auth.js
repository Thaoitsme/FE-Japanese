const DEFAULT_AUTH_ENDPOINTS = {
    login: "/api/v1/auth/login",
    register: "/api/v1/auth/register",
};

const DEFAULT_REDIRECT_DELAY = 900;

const parseFormData = (form) => {
    const formData = new FormData(form);
    const payload = {};

    formData.forEach((value, key) => {
        if (value === "on") {
            payload[key] = true;
            return;
        }

        if (payload[key] !== undefined) {
            payload[key] = Array.isArray(payload[key]) ? [...payload[key], value] : [payload[key], value];
            return;
        }

        payload[key] = value;
    });

    return payload;
};

const resolveEndpoint = (authType) => {
    const apiClient = window.ApiClient;
    return apiClient?.endpoints?.auth?.[authType] ?? DEFAULT_AUTH_ENDPOINTS[authType];
};

const resolveBaseUrl = (form) => {
    if (form.dataset.apiBase) {
        return form.dataset.apiBase;
    }
    return window.ApiClient?.config?.baseUrl ?? "";
};

const requestAuth = async (path, options) => {
    if (window.ApiClient?.request) {
        return window.ApiClient.request(path, options);
    }

    const response = await fetch(`${options.baseUrl ?? ""}${path}`, {
        method: options.method ?? "GET",
        headers: {
            "Content-Type": "application/json",
            ...(options.headers ?? {}),
        },
        credentials: options.credentials ?? "include",
        body: options.body,
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
        const error = new Error(result?.message ?? "Không thể xử lý yêu cầu.");
        error.payload = result;
        throw error;
    }

    return result;
};

const showMessage = (element, message, state) => {
    if (!element) {
        return;
    }
    element.textContent = message;
    if (state) {
        element.dataset.state = state;
    } else {
        delete element.dataset.state;
    }
};

const handleAuthSubmit = async (event) => {
    event.preventDefault();

    const form = event.currentTarget;
    const authType = form.dataset.authForm;
    const messageElement = form.querySelector("[data-form-message]");
    const submitButton = form.querySelector('button[type="submit"]');

    const endpointPath = resolveEndpoint(authType);

    if (!authType || !endpointPath) {
        showMessage(messageElement, "Không xác định được biểu mẫu. Vui lòng thử lại.", "error");
        return;
    }

    showMessage(messageElement, "Đang xử lý...", undefined);
    submitButton.disabled = true;

    const payload = parseFormData(form);

    if (authType === "register" && payload.password !== payload.confirmPassword) {
        showMessage(messageElement, "Mật khẩu xác nhận không trùng khớp.", "error");
        submitButton.disabled = false;
        return;
    }

    const redirectUrl = form.dataset.redirectUrl;
    const baseUrl = resolveBaseUrl(form);

    try {
        const result = await requestAuth(endpointPath, {
            method: "POST",
            baseUrl,
            body: JSON.stringify(payload),
        });

        const accessToken = result.accessToken ?? result.data?.accessToken ?? result.data?.token;
        const refreshToken = result.refreshToken ?? result.data?.refreshToken ?? result.data?.tokens?.refreshToken;

        if (accessToken) {
            localStorage.setItem("nihongo.accessToken", accessToken);
        }
        if (refreshToken) {
            localStorage.setItem("nihongo.refreshToken", refreshToken);
        }

        showMessage(
            messageElement,
            authType === "login" ? "Đăng nhập thành công! Đang chuyển tiếp..." : "Đăng ký thành công! Hãy kiểm tra email và đăng nhập nhé.",
            "success",
        );

        if (redirectUrl) {
            setTimeout(() => {
                window.location.href = redirectUrl;
            }, DEFAULT_REDIRECT_DELAY);
        } else {
            submitButton.disabled = false;
        }
    } catch (error) {
        console.error(error);
        const errorMessage = error?.payload?.message ?? error?.message ?? "Có lỗi xảy ra. Vui lòng thử lại.";
        showMessage(messageElement, errorMessage, "error");
        submitButton.disabled = false;
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const authForm = document.querySelector("[data-auth-form]");
    if (authForm) {
        authForm.addEventListener("submit", handleAuthSubmit);
    }

    const closeButton = document.querySelector("[data-close-modal]");
    if (closeButton) {
        closeButton.addEventListener("click", () => {
            window.location.href = "index.html";
        });
    }
});
