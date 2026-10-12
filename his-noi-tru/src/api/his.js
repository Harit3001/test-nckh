/**
 * Lớp nghiệp vụ duy nhất mà component được phép gọi.
 * Mỗi hàm: thử API thật (ENDPOINTS) → nếu lỗi thì dùng mock (xem client.call).
 * Khi biết chính xác schema backend, chỉnh mapping tại đây, không đụng component.
 */
import { call, http, unwrap, ENDPOINTS as E } from './client.js';
import * as mock from './mock.js';

export { CATEGORIES } from './mock.js';

const get = (path, params) => http('GET', path, { params });

export const listPatients = (f) =>
  call(async () => {
    const r = await get(E.patients, f);
    const items = unwrap(r);
    return { items, counts: r?.counts || { cho: 0, dang: items.length, ra: 0 } };
  }, () => mock.listPatients(f));

export const getPatient = (id) => call(() => get(E.patient(id)).then((r) => r?.data ?? r), () => mock.getPatient(id));
export const savePatient = (p) => call(() => http('PUT', E.patient(p.id), { body: p }), () => mock.savePatient(p));
export const getCounts = (id) => call(() => get(E.counts(id)), () => mock.getCounts(id));

export const listPhieu = (pid) => call(() => get(E.phieuList(pid)).then(unwrap), () => mock.listPhieu(pid));
export const savePhieu = (pid, ph, isNew) =>
  call(
    () => (isNew ? http('POST', E.phieuList(pid), { body: ph }) : http('PUT', E.phieu(pid, ph.id), { body: ph })),
    () => mock.savePhieu(pid, isNew ? { ...ph, id: undefined } : ph)
  );
export const deletePhieu = (pid, id) => call(() => http('DELETE', E.phieu(pid, id)), () => mock.deletePhieu(pid, id));

export const listDrugCatalog = (q) => call(() => get(E.drugCatalog, { q }).then(unwrap), () => mock.listDrugCatalog(q));
export const addPhieuDrug = (pid, phieuId, d) =>
  call(() => http('POST', E.phieuDrugs(pid, phieuId), { body: d }), () => mock.addPhieuDrug(pid, phieuId, d));
export const removePhieuDrug = (pid, phieuId, rowId) =>
  call(() => http('DELETE', E.phieuDrug(pid, phieuId, rowId)), () => mock.removePhieuDrug(pid, phieuId, rowId));
export const movePhieuDrug = (pid, phieuId, rowId, dir) =>
  call(() => http('PUT', E.phieuDrug(pid, phieuId, rowId), { body: { move: dir } }), () => mock.movePhieuDrug(pid, phieuId, rowId, dir));

export const listServiceCatalog = (p) =>
  call(async () => {
    const r = await get(E.serviceCatalog, p);
    return { items: unwrap(r), total: r?.total ?? unwrap(r).length };
  }, () => mock.listServiceCatalog(p));
export const listExecRooms = (serviceId) => call(() => get(E.execRooms, { serviceId }).then(unwrap), () => mock.listExecRooms(serviceId));

export const listOrders = (pid, p) => call(() => get(E.orders(pid), p).then(unwrap), () => mock.listOrders(pid, p));
export const saveOrders = (pid, body) => call(() => http('POST', E.orders(pid), { body }), () => mock.saveOrders(pid, body));
export const updateDiagnosis = (pid, body) => call(() => http('PUT', E.patient(pid), { body }), () => mock.updateDiagnosis(pid, body));

export const listHistory = (pid) => call(() => get(E.history(pid)).then(unwrap), () => mock.listHistory(pid));
export const listRecords = (pid) => call(() => get(E.records(pid)).then(unwrap), () => mock.listRecords(pid));
export const printDoc = (pid, kind) => call(() => get(E.print(pid, encodeURIComponent(kind))), () => mock.printDoc(pid, kind));
