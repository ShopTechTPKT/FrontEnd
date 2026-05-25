import axiosInstance from "../custom/axios";

export const fetchAuditLogs = (params) => axiosInstance.get('/audit-logs', { params }).then(r => r.data);
export const exportAuditLogs = (params) => axiosInstance.get('/audit-logs/export', { params, responseType: "blob" });
