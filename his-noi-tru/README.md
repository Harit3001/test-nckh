# HIS Nội trú — React + Vite

Dựng lại giao diện HIS (BV Đa khoa TTH Quảng Bình) thành component có luồng liên kết, nối backend Benh-An-Blockchain.

## Chạy
```bash
cp .env.example .env
npm install
npm run dev          # http://localhost:5173
```

## Luồng màn hình
```
PatientSidebar (lọc + chọn bệnh nhân)
   └─► PatientTabs (Thông tin · Thuốc-VT · XN · CĐHA-TDCN · PTTT · DV khác · Lịch sử · Bệnh án điện tử)
ActionToolbar
   ├─ Sửa BA / Lưu BA / Hủy      → sửa hành chính + chẩn đoán trong InfoTab
   ├─ Ph. điều trị               → PhieuDieuTriModal
   │     ├─ Thêm/Sửa/Xóa/Lưu     → PhieuForm (diễn biến, y lệnh, sinh hiệu)
   │     ├─ Thuốc - Vật tư       → PhieuDrugPanel (kê thuốc, ↑↓, xóa)
   │     └─ Dịch vụ              → ChiDinhDichVuModal
   │            └─ Lưu           → bump() → tab CĐHA/XN/... và số đếm tự tải lại
   └─ In                         → PrintMenu (tìm kiếm + danh sách phiếu/báo cáo)
```
Trạng thái dùng chung: `src/context/HisContext.jsx`.

## Nối backend
- Base URL: `VITE_API_URL`.
- Toàn bộ đường dẫn: `src/api/endpoints.js` (**đang là giả định, cần đối chiếu với /docs**).
- Mapping request/response: `src/api/his.js`.
- `VITE_USE_MOCK=auto` → gọi API thật, lỗi thì dùng `src/api/mock.js` và hiện banner.
- Token: `setToken()` trong `src/api/client.js` (Bearer).

Dữ liệu mẫu đã ẩn danh (tên, số thẻ, điện thoại là giả).
