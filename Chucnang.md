# TÀI LIỆU MÔ TẢ CHI TIẾT CHỨC NĂNG & API (Gia-Su-AI-BE)
> Người biên soạn: Codex • Phạm vi: FastAPI `/api/v1` • Cập nhật: 02/03/2026

## MỤC LỤC
1. Tổng quan & Phân quyền
2. API cho Học viên (Student)
3. API cho Giảng viên (Instructor)
4. API cho Quản trị viên (Admin)
5. Chức năng chung (Common/Search)
6. Adaptive Learning & Trend Analysis
7. Convention & Lưu ý

---

## 1. TỔNG QUAN & PHÂN QUYỀN
| Vai trò | Mã | Quyền chính | Ví dụ endpoint |
|---------|-----|-------------|----------------|
| **Student** | `student` | Học, làm bài, xem/chỉnh hồ sơ | /courses/public, /assessments/*, /progress/* |
| **Instructor** | `instructor` | Tạo lớp, quản lý quiz lớp | /classes/*, /quizzes (list/create/update), /analytics/instructor/* |
| **Admin** | `admin` | Quản trị hệ thống | /admin/* |

**Giải thích cột “Quyền”:** `Public` (không đăng nhập) • `Optional` (không đăng nhập vẫn xem, đăng nhập trả thêm dữ liệu) • `Student` / `Instructor` / `Admin` (yêu cầu đúng role) • `Instructor (owner)` (giảng viên sở hữu lớp/quiz).

---

## 2. API CHO HỌC VIÊN (STUDENT)

### 2.1 Xác thực & Hồ sơ
| STT | Chức năng | API | Mô tả chi tiết | Quyền |
|-----|-----------|-----|---------------|-------|
| 2.1.1 | Đăng ký tài khoản | POST `/auth/register` | Nhận full_name/email/password; kiểm tra email trùng; tạo user role=student; trả thông tin & token. | Public |
| 2.1.2 | Đăng nhập | POST `/auth/login` | Xác thực email+password; trả access (15p) + refresh (7d/1d); hỗ trợ remember_me; 401 nếu sai/khóa. | Public |
| 2.1.3 | Đăng xuất | POST `/auth/logout` | Vô hiệu token hiện tại, xóa mọi refresh token của user. | Student |
| 2.1.4 | Xem hồ sơ | GET `/users/me` | Lấy thông tin user đang đăng nhập. | Student |
| 2.1.5 | Cập nhật hồ sơ | PATCH `/users/me` | Cập nhật các trường tùy chọn; validate tên ≥2 ký tự, bio ≤500, URL hợp lệ. | Student |

### 2.2 Đánh giá năng lực & Đề xuất
| STT | Chức năng | API | Mô tả chi tiết | Quyền |
|-----|-----------|-----|---------------|-------|
| 2.2.1 | Sinh bài đánh giá AI | POST `/assessments/generate` | AI (Gemini) tạo quiz 15/25/35 câu theo level; không dùng ngân hàng câu hỏi. | Student |
| 2.2.2 | Nộp bài đánh giá | POST `/assessments/{session_id}/submit` | Chấm điểm trọng số (1/2/3), lưu kết quả phiên. | Student |
| 2.2.3 | Xem kết quả đánh giá | GET `/assessments/{session_id}/results` | Trả điểm, phân loại trình độ, skill strengths/weaknesses, knowledge gaps, time analysis. | Student |
| 2.2.4 | Lấy đề xuất từ assessment | GET `/recommendations/from-assessment?session_id=` | Sinh lộ trình ưu tiên courses/modules/practice. | Student |
| 2.2.5 | Lấy đề xuất chung | GET `/recommendations` | Gợi ý khóa dựa lịch sử & sở thích. | Student |

### 2.3 Khám phá & Đăng ký khóa học
| STT | Chức năng | API | Mô tả chi tiết | Quyền |
|-----|-----------|-----|---------------|-------|
| 2.3.1 | Tìm kiếm khóa học | GET `/courses/search` | Tìm theo từ khóa (tên/mô tả), danh mục (Programming/Math/Business...), cấp độ (Beginner/Intermediate/Advanced); hỗ trợ sắp xếp (mới nhất/cũ nhất) và pagination `skip/limit`; trả `is_enrolled` nếu đã đăng nhập; FE có thể bổ sung filter nâng cao (thời lượng, ngày tạo, số học viên). | Optional (Public; nếu đăng nhập trả thêm is_enrolled) |
| 2.3.2 | Hiển thị danh sách khóa công khai | GET `/courses/public` | Hiển thị tất cả khóa status=published; lọc category/level; pagination; mỗi item gồm title, thumbnail, mô tả ngắn, thời lượng ước tính, số modules/lessons, cấp độ. | Optional |
| 2.3.3 | Xem chi tiết khóa học | GET `/courses/{course_id}` | Lấy metadata, instructor, cấu trúc module/lesson, thống kê (enrollment_count, avg_rating, completion_rate). Nếu đã đăng nhập & enroll, trả thêm trạng thái hoàn thành từng lesson/module và `is_enrolled`. | Optional |
| 2.3.4 | Đăng ký khóa học | POST `/enrollments` | Nhận `course_id`; kiểm tra khóa tồn tại & published, chưa đăng ký trước đó; tạo enrollment status=`active`, tăng enrollment_count; trả thông tin enrollment. | Student |
| 2.3.5 | Xem các khóa đã đăng ký | GET `/enrollments/my-courses` | Liệt kê khóa của user; filter `status` (active/completed/cancelled), pagination; kèm progress %, next_lesson, summary in-progress/completed/cancelled. | Student |
| 2.3.6 | Xem chi tiết enrollment | GET `/enrollments/{enrollment_id}` | Trả chi tiết course, số lessons/modules đã hoàn thành, % tổng thể, quiz avg, total study time, next_lesson, timestamps. | Student (owner) |
| 2.3.7 | Hủy đăng ký khóa học | DELETE `/enrollments/{enrollment_id}` | Soft cancel; giữ progress để xem lại; giảm enrollment_count; trả message xác nhận. | Student (owner) |
| 2.3.8 | Kiểm tra quyền truy cập khóa | GET `/courses/{course_id}/enrollment-status` | Trả `is_enrolled`, `enrollment_id`, `status`, `progress_percent`, `can_access_content`; dùng trước khi mở lesson. | Student |

### 2.4 Học liệu, Module, Quiz (học viên)
| STT | Chức năng | API | Mô tả chi tiết | Quyền |
|-----|-----------|-----|---------------|-------|
| 2.4.1 | Xem module học | GET `/courses/{course_id}/modules/{module_id}` | Hiển thị tiêu đề, mô tả, độ khó, danh sách lessons (completed/locked), outcomes, resources, progress. | Student |
| 2.4.2 | Xem nội dung bài học | GET `/courses/{course_id}/lessons/{lesson_id}` | Trả nội dung text/HTML/video, tài liệu đính kèm, quiz kèm (nếu có), navigation prev/next, trạng thái khóa bài tiếp theo. | Student |
| 2.4.3 | Liệt kê modules trong khóa | GET `/courses/{course_id}/modules` | Danh sách toàn bộ modules của khóa, kèm trạng thái và progress. | Student |
| 2.4.4 | Lấy outcomes module | GET `/courses/{course_id}/modules/{module_id}/outcomes` | Hiển thị learning outcomes và trạng thái đạt. | Student |
| 2.4.5 | Lấy tài nguyên module | GET `/courses/{course_id}/modules/{module_id}/resources` | Trả danh sách resources (PDF, slides, code, video, links) được nhóm theo loại. | Student |
| 2.4.6 | Sinh quiz module bằng AI | POST `/courses/{course_id}/modules/{module_id}/assessments/generate` | AI tạo quiz theo outcomes và độ khó yêu cầu. | Student |
| 2.4.7 | Lấy danh sách lessons cần review | GET `/enrollments/{enrollment_id}/lessons-to-review` | Danh sách lessons cần ôn lại sau khi fail assessment; include_reviewed để hiển thị cả bài đã review. | Student |
| 2.4.8 | Đánh dấu đã review bài học | POST `/enrollments/{enrollment_id}/lessons/{lesson_id}/mark-reviewed` | Cập nhật trạng thái lesson đã review trong luồng ôn tập. | Student |

### 2.5 Quiz (Student)
| STT | Chức năng | API | Mô tả chi tiết | Quyền |
|-----|-----------|-----|---------------|-------|
| 2.5.1 | Xem chi tiết quiz | GET `/quizzes/{quiz_id}` | Hiển thị đề, thời gian, số lần làm, pass_score, số câu. | Student |
| 2.5.2 | Làm quiz và nộp bài | POST `/quizzes/{quiz_id}/attempt` | Gửi answers; chấm điểm; lưu attempt; trả kết quả. | Student |
| 2.5.3 | Xem kết quả quiz | GET `/quizzes/{quiz_id}/results[?attempt_id=]` | Xem điểm, đúng/sai, giải thích, câu bắt buộc; chọn attempt_id hoặc lấy gần nhất. | Student |
| 2.5.4 | Kiểm tra điều kiện retake | GET `/quizzes/{quiz_id}/retake-status` | Kiểm tra các điều kiện/lessons bắt buộc trước khi retake. | Student |
| 2.5.5 | Làm lại quiz | POST `/quizzes/{quiz_id}/retake` | Tạo attempt mới (câu hỏi AI biến thể) cho quiz đã fail. | Student |
| 2.5.6 | Sinh bài luyện tập AI | POST `/ai/generate-practice` | AI tạo bài tập theo chủ đề, độ khó, loại câu hỏi; trả danh sách câu hỏi luyện tập. | Student |

### 2.6 Chatbot AI (Multimodal RAG)
| STT | Chức năng | API | Mô tả chi tiết | Quyền |
|-----|-----------|-----|---------------|-------|
| 2.6.1 | Hỏi đáp AI đa phương thức | POST `/chat/course/{course_id}` | Gửi câu hỏi (text) và optional image_base64 + mime; context_type (lesson/module/general); trả answer markdown, sources, related_lessons, flags has_image/image_analyzed. | Student |
| 2.6.2 | Xem lịch sử chat | GET `/chat/history` | Lấy danh sách conversations theo course_id (optional); pagination skip/limit. | Student |
| 2.6.3 | Xem chi tiết hội thoại | GET `/chat/conversations/{conversation_id}` | Hiển thị toàn bộ messages và AI summary. | Student |
| 2.6.4 | Xóa toàn bộ lịch sử chat | DELETE `/chat/conversations` | Xóa tất cả conversations của user. | Student |
| 2.6.5 | Xóa một conversation | DELETE `/chat/history/{conversation_id}` | Xóa conversation cụ thể. | Student |

### 2.7 Dashboard & Analytics (Student)
| STT | Chức năng | API | Mô tả chi tiết | Quyền |
|-----|-----------|-----|---------------|-------|
| 2.7.1 | Xem dashboard học viên | GET `/dashboard/student` | Tóm tắt khóa đang học, quiz pending, lessons completed, điểm trung bình. | Student |
| 2.7.2 | Xem thống kê học tập | GET `/analytics/learning-stats` | Tổng hợp lessons completed, quizzes pass/fail, avg score, breakdown theo khóa. | Student |
| 2.7.3 | Xem biểu đồ tiến độ | GET `/analytics/progress-chart?time_range=day|week|month&course_id=` | Trả dữ liệu line/bar chart theo thời gian; tùy chọn filter course. | Student |

### 2.8 Theo dõi tiến độ & Kỹ năng
| STT | Chức năng | API | Mô tả chi tiết | Quyền |
|-----|-----------|-----|---------------|-------|
| 2.8.1 | Xem tiến độ khóa học | GET `/progress/course/{course_id}` | Trả progress %, breakdown module/lesson, total_time_spent_minutes, estimated_hours_remaining, streak, avg_quiz_score. | Student |
| 2.8.2 | Lấy danh sách điểm yếu tích lũy | GET `/progress/weak-skills/{course_id}` | Trả weak skills theo threshold/include_all, trend và priority; phục vụ gợi ý ôn tập. | Student |
| 2.8.3 | Xem lịch sử một skill | GET `/progress/skill-history/{course_id}/{skill_tag}` | Lịch sử proficiency, attempts, trend, improvement rate, priority. | Student |
| 2.8.4 | Xem tổng quan skills | GET `/progress/skills-overview/{course_id}` | Phân loại Strong/Average/Weak; trả danh sách skills và overall proficiency. | Student |
| 2.8.5 | Xem dashboard skill gaps | GET `/progress/dashboard/skill-gaps/{course_id}[?include_ai_insights=true]` | Dashboard tổng quan: stats, heatmap, trend, top weaknesses; tùy chọn AI insights. | Student |
| 2.8.6 | So sánh với lớp | GET `/progress/analytics/compare-with-class/{course_id}` | So sánh proficiency cá nhân với trung bình lớp, rank/percentile. | Student |

---

## 3. API CHO GIẢNG VIÊN (INSTRUCTOR)

### 3.1 Quản lý lớp học
| STT | Chức năng | API | Mô tả chi tiết | Quyền |
|-----|-----------|-----|---------------|-------|
| 3.1.1 | Tạo lớp học | POST `/classes` | Tạo lớp từ public course; auto invite_code (6-8 ký tự), status=preparing; validate course tồn tại. | Instructor |
| 3.1.2 | Xem danh sách lớp của tôi | GET `/classes/my-classes[?status=]` | Liệt kê lớp của instructor; filter status; sort created_at DESC. | Instructor |
| 3.1.3 | Xem chi tiết lớp | GET `/classes/{class_id}` | Thông tin class, invite_code, danh sách học viên + progress, statistics. | Instructor (owner) |
| 3.1.4 | Cập nhật lớp học | PUT `/classes/{class_id}` | Cập nhật; không giảm max_students dưới hiện tại, không đổi start_date nếu đã bắt đầu. | Instructor (owner) |
| 3.1.5 | Xóa lớp học | DELETE `/classes/{class_id}` | Chỉ nếu chưa có student hoặc status=completed. | Instructor (owner) |
| 3.1.6 | Cho học viên tham gia bằng code | POST `/classes/join` | Student nhập invite_code; validate class active & chưa full; auto tạo enrollment. | Student |

### 3.2 Quản lý học viên trong lớp
| STT | Chức năng | API | Mô tả chi tiết | Quyền |
|-----|-----------|-----|---------------|-------|
| 3.2.1 | Xem danh sách học viên | GET `/classes/{class_id}/students` | Pagination; hiển thị progress, completed modules, quiz avg, last activity. | Instructor (owner) |
| 3.2.2 | Xem chi tiết học viên | GET `/classes/{class_id}/students/{student_id}` | Hồ sơ học viên trong lớp; quiz scores; progress per module. | Instructor (owner) |
| 3.2.3 | Loại học viên khỏi lớp | DELETE `/classes/{class_id}/students/{student_id}` | Soft remove; update enrollment status=removed; giữ dữ liệu progress. | Instructor (owner) |
| 3.2.4 | Xem progress toàn lớp | GET `/classes/{class_id}/progress` | Analytics lớp: score distribution, module completion rates, lessons phổ biến. | Instructor (owner) |

### 3.3 Quiz (Giảng viên)
| STT | Chức năng | API | Mô tả chi tiết | Quyền |
|-----|-----------|-----|---------------|-------|
| 3.3.1 | Tạo quiz cho lesson | POST `/lessons/{lesson_id}/quizzes` | Nhập câu hỏi/đáp án/thời gian/pass_rate; cảnh báo nếu đã có attempt. | Instructor |
| 3.3.2 | Lọc danh sách quiz | GET `/quizzes` | Filter course_id/class_id/search, sort (created_at/title/pass_rate), pagination. | Instructor |
| 3.3.3 | Cập nhật quiz | PUT `/quizzes/{quiz_id}` | Sửa nội dung/độ khó/pass_rate; cảnh báo nếu đã có attempt. | Instructor |
| 3.3.4 | Xóa quiz | DELETE `/quizzes/{quiz_id}` | Chỉ xóa nếu chưa có học viên làm. | Instructor |
| 3.3.5 | Xem kết quả lớp cho quiz | GET `/quizzes/{quiz_id}/class-results?class_id=` | Phân tích điểm TB, phân bố, hardest questions cho một class. | Instructor (owner) |

### 3.4 Dashboard & Analytics (Giảng viên)
| STT | Chức năng | API | Mô tả chi tiết | Quyền |
|-----|-----------|-----|---------------|-------|
| 3.4.1 | Xem dashboard giảng viên | GET `/dashboard/instructor` | Tóm tắt active classes, total students, quizzes created, avg completion rate, recent classes, quick actions. | Instructor |
| 3.4.2 | Xem thống kê lớp | GET `/analytics/instructor/classes` | Metrics per class (student_count, attendance_rate, avg_progress, quiz_completion, active_students); optional class_id filter. | Instructor |
| 3.4.3 | Xem biểu đồ tiến độ lớp | GET `/analytics/instructor/progress-chart` | Trả dữ liệu lessons_completed, quizzes_completed, active_students theo time_range (day/week/month); filter class_id. | Instructor |
| 3.4.4 | Xem hiệu quả quiz | GET `/analytics/instructor/quiz-performance` | Trả attempts, pass/fail rates, avg scores, hardest questions, score distribution. | Instructor |

---

## 4. API CHO QUẢN TRỊ VIÊN (ADMIN)

### 4.1 Quản lý người dùng
| STT | Chức năng | API | Mô tả chi tiết | Quyền |
|-----|-----------|-----|---------------|-------|
| 4.1.1 | Xem danh sách user | GET `/admin/users` | Table + filter role/status/search/sort/pagination. | Admin |
| 4.1.2 | Xem hồ sơ user | GET `/admin/users/{user_id}` | Thông tin cá nhân, statistics, enrollments/classes. | Admin |
| 4.1.3 | Tạo user mới | POST `/admin/users` | Nhập name/email/role/password (nếu instructor/admin); student pending. | Admin |
| 4.1.4 | Cập nhật user | PUT `/admin/users/{user_id}` | Sửa bất kỳ field; cho phép đổi role/status. | Admin |
| 4.1.5 | Xóa user | DELETE `/admin/users/{user_id}` | Xóa vĩnh viễn; kiểm tra dependencies trước. | Admin |
| 4.1.6 | Đổi role user | PUT `/admin/users/{user_id}/role` | Nâng/hạ role; cảnh báo ảnh hưởng. | Admin |
| 4.1.7 | Reset mật khẩu user | POST `/admin/users/{user_id}/reset-password` | Force reset; admin gửi mật khẩu mới qua kênh ngoài. | Admin |

### 4.2 Quản lý khóa học
| STT | Chức năng | API | Mô tả chi tiết | Quyền |
|-----|-----------|-----|---------------|-------|
| 4.2.1 | Xem danh sách khóa | GET `/admin/courses` | Liệt kê all courses (public+personal); filter status/creator/category; sort created_at/enrollment_count/title; pagination. | Admin |
| 4.2.2 | Xem chi tiết khóa | GET `/admin/courses/{course_id}` | Metadata, modules/lessons structure, analytics. | Admin |
| 4.2.3 | Tạo khóa chính thức | POST `/admin/courses` | Tạo public course; thiết kế modules/lessons; có thể publish ngay. | Admin |
| 4.2.4 | Chỉnh sửa khóa | PUT `/admin/courses/{course_id}` | Sửa bất kỳ course (kể cả personal). | Admin |
| 4.2.5 | Xóa khóa | DELETE `/admin/courses/{course_id}` | Xóa vĩnh viễn; kiểm tra impact enrollments/classes. | Admin |
| 4.2.6 | Tạo module trong khóa | POST `/admin/courses/{course_id}/modules` | Thêm module mới cho course. | Admin |
| 4.2.7 | Tạo lesson trong module | POST `/admin/courses/{course_id}/modules/{module_id}/lessons` | Thêm lesson mới cho module. | Admin |

### 4.3 Giám sát lớp học
| STT | Chức năng | API | Mô tả chi tiết | Quyền |
|-----|-----------|-----|---------------|-------|
| 4.3.1 | Xem danh sách lớp | GET `/admin/classes` | Liệt kê toàn bộ classes; filter instructor/status; pagination; sort. | Admin |
| 4.3.2 | Xem chi tiết lớp | GET `/admin/classes/{class_id}` | Instructor, students, progress, statistics. | Admin |

### 4.4 Dashboard quản trị
| STT | Chức năng | API | Mô tả chi tiết | Quyền |
|-----|-----------|-----|---------------|-------|
| 4.4.1 | Xem dashboard hệ thống | GET `/dashboard/admin` | Tổng quan users, courses, enrollments. | Admin |
| 4.4.2 | Xem tăng trưởng user | GET `/admin/analytics/users-growth` | time_range=7d/30d/90d, role_filter; line chart breakdown. | Admin |
| 4.4.3 | Phân tích khóa học | GET `/admin/analytics/courses` | Top courses, completion rates, creation trends. | Admin |
| 4.4.4 | Giám sát system health | GET `/admin/analytics/system-health` | API response time, error rate, DB performance, storage, alerts. | Admin |

---

## 5. CHỨC NĂNG CHUNG (COMMON)
| STT | Chức năng | API | Mô tả chi tiết | Quyền |
|-----|-----------|-----|---------------|-------|
| 5.1.1 | Thực hiện universal search | GET `/search` | Full-text đa đối tượng (courses/users/classes/modules/lessons); filter category/level/instructor/rating; pagination; typo tolerance; grouped results. | Optional |
| 5.1.2 | Gợi ý tìm kiếm realtime | GET `/search/suggestions` | Autocomplete khi gõ; trả danh sách gợi ý. | Optional |
| 5.1.3 | Xem lịch sử tìm kiếm | GET `/search/history` | Lịch sử cá nhân 20 lần gần nhất + popular terms. | Student |
| 5.1.4 | Xem analytics tìm kiếm | GET `/search/analytics` | Thống kê hiệu suất search, popular queries, no-result, response time. | Admin |

---

## 6. ADAPTIVE LEARNING & TREND ANALYSIS
| STT | Chức năng | API | Mô tả chi tiết | Quyền |
|-----|-----------|-----|---------------|-------|
| 6.1 | Áp dụng assessment để auto-skip | POST `/adaptive-learning/apply-assessment` | Dùng kết quả assessment và ngưỡng skip/time để bỏ qua modules, cập nhật progress, tính time_saved. | Student |
| 6.2 | Tạo lộ trình thích ứng | POST `/adaptive-learning/create-adaptive-path` | Sinh quyết định SKIP/REVIEW/START/UNLOCK/LOCKED cho từng module; trả summary counts. | Student |
| 6.3 | Ghi nhận hoàn thành & điều chỉnh | POST `/adaptive-learning/track-completion` | Gửi time_spent_seconds, quiz_score, attempts; service tính adjustment (skip/review/tăng độ khó/spaced repetition). | Student |
| 6.4 | Xác nhận đề xuất điều chỉnh | POST `/adaptive-learning/enrollment/{enrollment_id}/accept-adjustment` | Ghi nhận học viên chấp nhận/từ chối đề xuất gần nhất. | Student |
| 6.5 | Xem thông tin adaptive | GET `/adaptive-learning/enrollment/{enrollment_id}/adaptive-info` | Trả trạng thái adaptive, skipped_modules, recommended_start_module_id, decisions, auto_skipped_lessons, adjustment_history. | Student |
| 6.6 | Phân tích xu hướng cá nhân | GET `/analytics/trends/{course_id}?time_window_days=` | Phân tích improving/declining/stable/fluctuating; skill/engagement trend; alerts; prediction. | Student |
| 6.7 | Lấy kế hoạch can thiệp | GET `/analytics/trends/intervention-plan/{course_id}` | Sinh plan: priority, timeline, actions, success metrics. | Student |
| 6.8 | Kiểm tra & trigger can thiệp | POST `/analytics/trends/check-intervention/{course_id}` | Kiểm tra xu hướng, gửi cảnh báo/notification nếu cần. | Student |
| 6.9 | Phân tích xu hướng toàn course | GET `/analytics/trends/course/{course_id}` | Instructor/Admin/Owner xem students at risk, phân bố improving/declining, interventions summary. | Instructor/Admin/Owner |
| 6.10 | Chạy batch intervention toàn course | POST `/analytics/trends/batch-intervention/{course_id}` | Thực thi can thiệp hàng loạt cho tất cả students at risk trong course. | Instructor/Admin/Owner |

---

## 7. CONVENTION & LƯU Ý
1) Prefix: `/api/v1`.  
2) Auth: JWT; Optional cho search/public để trả thêm is_enrolled khi có token.  
3) ID: UUID v4 đặt rõ `{course_id}`, `{module_id}`, `{lesson_id}`, `{quiz_id}`, `{class_id}`, `{user_id}`, `{enrollment_id}`, `{session_id}`.  
4) Datetime: ISO-8601 UTC.  
5) Pagination: `skip` + `limit` (limit ≤ 100).  
6) CORS: cấu hình `.env` → `ALLOWED_ORIGINS` (đăng ký tại `app/main.py`).  
7) Naming: snake_case; response theo `schemas/*`.  
8) Lifespan: `app/main.py` setup_logging → init_database → close_database.  
9) Logging: `config/logging_config.py`; điều chỉnh theo môi trường.  
10) Cập nhật: 02/03/2026 – rà soát lại khi đổi API/DB/role.
