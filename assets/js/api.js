const ApiConfig = {
    baseUrl: "",
    defaultHeaders: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
};

const ApiEndpoints = {
    auth: {
        login: "/api/v1/auth/login",
        register: "/api/v1/auth/register",
        logout: "/api/v1/auth/logout",
        refresh: "/api/v1/auth/refresh",
        profile: "/api/v1/auth/me",
    },
};

const mergeHeaders = (override = {}) => {
    const headers = new Headers(ApiConfig.defaultHeaders);
    Object.entries(override).forEach(([key, value]) => {
        if (value === undefined || value === null) {
            return;
        }
        headers.set(key, value);
    });
    return headers;
};

const apiRequest = async (path, options = {}) => {
    const finalUrl = `${options.baseUrl ?? ApiConfig.baseUrl}${path}`;
    const fetchOptions = {
        method: options.method ?? "GET",
        credentials: options.credentials ?? (ApiConfig.withCredentials ? "include" : "same-origin"),
        headers: mergeHeaders(options.headers),
        body: options.body,
    };

    const response = await fetch(finalUrl, fetchOptions);
    let payload = null;

    try {
        payload = await response.json();
    } catch {
        payload = null;
    }

    if (!response.ok) {
        const error = new Error(payload?.message ?? "Yêu cầu không thành công.");
        error.status = response.status;
        error.payload = payload;
        throw error;
    }

    return payload;
};

window.ApiClient = {
    config: ApiConfig,
    endpoints: ApiEndpoints,
    request: apiRequest,
};
