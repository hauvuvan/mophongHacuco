# Quy tắc Phát triển & Lịch sử Dự án HACUCO (Project Rules & Work History)

Tài liệu này ghi lại toàn bộ lịch sử phát triển, các quyết định kiến trúc quan trọng và quy tắc thiết kế UI/UX của dự án **Mô phỏng lắp đặt pin mặt trời HACUCO**. Mọi Agent khi làm việc trên repository này trong tương lai đều phải tuân thủ nghiêm ngặt các quy tắc dưới đây.

---

## 1. Lịch sử phát triển & Cột mốc (Work History & Milestones)

Dự án đã trải qua các giai đoạn cải tiến quan trọng dựa trên phản hồi của người dùng:
1. **Khởi tạo PWA:** Cấu hình Service Worker (`sw.js`) và Manifest (`manifest.json`) để ứng dụng có thể cài đặt độc lập trên di động và hoạt động offline.
2. **Form thông tin khách hàng:** Bổ sung các trường nhập liệu Tên, Số điện thoại, Địa chỉ lắp đặt tại Sidebar.
3. **Thu gọn/Mở rộng các bước:** Cấu hình các Bước từ 0 đến 5 trong Sidebar đều có nút thu gọn/mở rộng bằng mũi tên trạng thái `▶/▼` để tránh rối mắt.
4. **Thiết kế bố cục 2 cột tối ưu:**
   - **Sidebar Trái (350px):** Chứa tất cả các bước nhập liệu (Bước 0 - 4) và bảng **Kết quả thiết kế (Bước 5)** tích hợp ở đáy cột. Cấu hình cuộn độc lập (`overflow-y: auto`, `height: calc(100vh - 48px)`), loại bỏ hoàn toàn lỗi hụt chân Sidebar.
   - **Stage mô phỏng (Phần còn lại):** Chiếm trọn vẹn bề rộng còn lại của màn hình, cho không gian kéo thả và vẽ phác thảo nháp rộng rãi nhất.
5. **Cố định tiêu đề & Khóa cuộn trang:** Thiết lập lớp bao Stage `overflow: hidden` và lớp vẽ `.stage { flex: 1; height: 100%; overflow: auto; }` để loại bỏ hoàn toàn lỗi cuộn lồng trang trình duyệt. Chỉ vùng vẽ cuộn cục bộ khi vượt quá kích thước.
6. **Hộp thoại Custom Confirm:** Thay thế toàn bộ popup xác nhận mặc định của trình duyệt (`window.confirm`) khi xóa dự án hoặc dọn nét vẽ bằng hộp thoại overlay tự xây dựng mượt mà, tối ưu trên cả Mobile/Tablet.
7. **Đồng bộ hóa thông tin thẻ dự án:**
   - Hiển thị đầy đủ thông tin Khách hàng (Tên, SĐT, Địa chỉ) trực tiếp trên các card ngoài Dashboard.
   - Hiển thị song song hai mốc thời gian: **Tạo lúc** (lưu vào `createdAt`) và **Cập nhật** (lưu vào `updatedAt`).
8. **Ràng buộc chuẩn hóa Số điện thoại (SĐT):**
   - Chỉ cho phép gõ số, tự động giới hạn tối đa **10 chữ số**.
   - Tự động đổi đầu `84...` quốc tế thành `0...`.
   - Tự động thêm đầu số `0` nếu người dùng bắt đầu gõ bằng đầu số di động khác.
   - Hiển thị cảnh báo màu cam nếu số điện thoại chưa đủ 10 số.

---

## 2. Quy tắc thiết kế UI/UX (UI/UX Guidelines)

* **Không dùng popup mặc định:** Tuyệt đối không dùng `window.confirm`, `window.alert` hay `window.prompt`. Phải sử dụng hoặc nhân bản cấu trúc `confirm-modal-overlay` có sẵn để đảm bảo tính mỹ thuật cao cấp.
* **Layout 2 cột cố định:**
  - Sidebar bên trái phải có chiều rộng cố định `350px` trên Desktop. Chiều cao Sidebar phải chạm đáy màn hình và cuộn độc lập.
  - Vùng vẽ mô phỏng Stage bên phải phải chiếm trọn chiều rộng còn lại (`1fr`).
* **Tránh lỗi cuộn trình duyệt (No Outer Scrollbar):** Khung ứng dụng chính `.app` phải luôn luôn có chiều cao `100vh` và ẩn thanh cuộn chung (`overflow: hidden`). Chỉ cho phép cuộn nội bộ trong Sidebar hoặc trong `.stage`.
* **Thanh công cụ vẽ nháp (.scribble-dock):**
  - Desktop: Định vị cố định sát mép phải màn hình (`right: 24px`).
  - Mobile: Tự động xếp ngang ở sát đáy màn hình.

---

## 3. Ràng buộc & Logic dữ liệu (Data & Logic Constraints)

* **Giới hạn tọa độ pin (Drag Limits):** Khi kéo thả các tấm pin trong [Stage.jsx](file:///Users/hauvu/Desktop/mophonglapdat/src/components/Stage.jsx), tọa độ `x`, `y` của pin phải luôn được giới hạn trong biên của mái tương ứng bằng hàm `getRoofContainerDims(roof)`. Không cho phép pin bị kéo tuột ra ngoài khu vực bao mái.
* **Chuẩn hóa SĐT:** Luôn áp dụng logic lọc số và kiểm tra độ dài 10 chữ số bắt đầu bằng số 0. Hiển thị thông báo hướng dẫn cụ thể bên dưới ô nhập khi chưa đạt chuẩn.

---

## 4. Biên dịch & Đóng gói sản phẩm (Build & Deploy)

* Trước khi bàn giao hay kết thúc lượt làm việc, luôn chạy kiểm thử biên dịch dự án bằng lệnh:
  ```bash
  npm run build
  ```
  Để đảm bảo mã nguồn sạch, không có bất kỳ lỗi Rollup/Vite hay import sai lệch nào.
