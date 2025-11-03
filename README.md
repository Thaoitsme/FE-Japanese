
# FE-Japan Frontend

Landing page và hệ thống giao diện cho nền tảng học tiếng Nhật ứng dụng AI. Dự án sử dụng HTML, CSS và JavaScript thuần, kết nối với backend thông qua các API `v1/auth` mà bạn đã cung cấp.

# Tổng quan 
Hiện tại khóa học đang có 2 bài là bài 1 chương 1 (có ảnh gif - bảng chữ cái) và bài 1 chương 4 (không có ảnh gif nhưng có âm thanh - luyện hội thoại)
Hệ thống được chia theo:
    Course (Khóa học) → chứa nhiều Chương (Unit)
        Mỗi Chương (Unit) → chứa nhiều Bài học (Lesson) 
        Mỗi Lesson → gồm 4 file dữ liệu:
            meta.json – Thông tin tổng quan - Hiển thị tiêu đề, tiến độ, và điều hướng.
            theory.json – Lý thuyết phần luyện viết (gif hướng dẫn), hội thoại
            simulation.json – Video dạng url 
            practice.json – Bài tập (Quiz, Nghe hiểu, Tự luận)
            sidebar.json – Điều hướng giữa các chương
    * Cơ bản của pratice chỉ có quiz
    Phần tiến độ, nghe hiểu, tự luận là thuộc phần có thể có hoặc không

# Các tài nguyên về âm thanh / Test đầu vào
Tất cả các tài nguyên về âm thanh/Test đầu vào đều được lưu tại GG Drive đường link sau
https://docs.google.com/document/d/1wVXhM0sLVuertcllADlHFhrb_8LdSkkemB3I88Uobk4/edit?usp=sharing
https://drive.google.com/drive/folders/1lMzkNrYQ0uvmpgP4986Gtf3IqhPo9vjZ?usp=sharing
# BE lưu đáp án ở phần bài tập tự luận (Optional)
Người dùng nhập phiên âm vd /watashi/ FE chuyển đổi sang chữ nhật và gửi tới BE
Tất cả dữ liệu dùng UTF-8 để hiển thị đúng tiếng Nhật
# Về ảnh gif hiển thị khi click chọn chữ
Ảnh gif sẽ được lưu dưới dạng Url

# Vấn đề đang gặp phải
Âm thanh được lưu tại GG Drive ban đầu để BE có thể lưu dạng url nhưng gg drive chặn phát nên chưa có hướng giải quyết cho việc lưu âm thanh

## Cấu trúc thư mục

```
FE-Japan/
├─ assets/
│  ├─ css/
│  │  ├─ styles.css        # Style tổng thể cho landing page & layout chung
│  │  └─ auth.css          # Style riêng cho các trang xác thực
│  ├─ js/
│  │  ├─ api.js            # Cấu hình & hàm gọi API trung tâm
│  │  ├─ script.js         # Script dùng chung cho landing/welcome page
│  │  └─ auth.js           # Xử lý logic đăng nhập/đăng ký
│  └─ images/              # Logo, background, icon (đang trống)
│
├─ pages/
│  ├─ index.html           # Trang welcome
│  ├─ login.html           # Trang đăng nhập
│  ├─ register.html        # Trang đăng ký
│  ├─ lesson/
│  │  ├─ lesson.html       # Shell trang bài học dùng module
│  │  └─ js/
│  │     ├─ lesson.js      # Controller, fetch data và khởi tạo module
│  │     ├─ sidebar.js     # Render mục lục chương
│  │     ├─ theory.js      # Render phần lý thuyết
│  │     ├─ simulation.js  # Render phần mô phỏng/video
│  │     └─ practice.js    # Render phần bài tập trắc nghiệm
│  └─ resources/
│     └─ lesson-1/         # Tài nguyên động cho từng phần bài học
│        ├─ meta.json
│        ├─ sidebar.json
│        ├─ theory.json
│        ├─ simulation.json
│        └─ practice.json
│  ├─ dashboard-admin.html # Khung dashboard admin (placeholder)
│  ├─ dashboard-teacher.html
│  ├─ dashboard-student.html
│  └─ course/              # Placeholder tài liệu khác
│     ├─ theory.html
│     ├─ interactive.html
│     └─ exercises.html
│
└─ README.md
```

## Thiết lập & chạy

1. Mở thư mục dự án bằng Live Server (hoặc bất kỳ HTTP server tĩnh nào) và trỏ tới `pages/index.html`.
2. Backend cần chạy cùng domain hoặc cấu hình CORS phù hợp để các request từ frontend hoạt động.
3. Đặt `window.ApiClient.config.baseUrl` trong `assets/js/api.js` nếu backend nằm ở domain/port khác (ví dụ `https://api.example.com`). Có thể set trực tiếp trong file hoặc gán giá trị qua script inline trước khi import `api.js`.

## Kết nối API auth

- `assets/js/api.js` cung cấp hàm `ApiClient.request(path, options)` và cấu hình chung.
- `assets/js/auth.js` đọc data attribute `data-auth-form` trên form (`login` | `register`) để quyết định endpoint, parse dữ liệu và gọi API.
- Tùy chỉnh base URL cho từng form bằng cách thêm `data-api-base="https://domain-backend"` nếu cần.


