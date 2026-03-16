export const createTransactionExcelData = (
  transactions = [],
  linenLabel = "",
  filterMonth = null
) => {
  const monthLabel = filterMonth
    ? new Date(filterMonth).toLocaleDateString("th-TH", {
        year: "numeric",
        month: "2-digit",
      })
    : "-";

  const headerTitle = ["รายงานการเคลื่อนไหวสต๊อกผ้า"];
  const headerLinen = [`ชื่อผ้า: ${linenLabel || "-"}`];
  const headerMonth = [`เดือน/ปี: ${monthLabel}`];

  const tableHeader = [
    "วัน-เดือน-ปี",
    "รายละเอียด",
    "ราคา",
    "รับ",
    "จ่าย",
    "คงเหลือ",
    "ผู้รับ",
    "ผู้จ่าย",
  ];

  let totalIn = 0;
  let totalOut = 0;

  const rows = transactions.map((row) => {
    if (row.status_type === "IN") totalIn += Number(row.amount || 0);
    if (row.status_type === "OUT") totalOut += Number(row.amount || 0);

    return [
      new Date(row.created_at).toLocaleDateString("th-TH"),
      row.partner_name || "-",
      row.price
        ? row.price.toLocaleString("th-TH", {
            style: "currency",
            currency: "THB",
          })
        : "-",
      row.status_type === "IN" ? row.amount : "-",
      row.status_type === "OUT" ? row.amount : "-",
      row.balance_after?.toLocaleString("th-TH") || "-",
      row.receiver || "-",
      row.payer || "-",
    ];
  });

  const lastBalance =
    transactions.length > 0
      ? transactions[transactions.length - 1].balance_after
      : 0;

  const summaryRow = [
    "รวม",
    "",
    "",
    totalIn,
    totalOut,
    lastBalance,
    "",
    "",
  ];

  return [
    headerTitle,
    headerLinen,
    headerMonth,
    tableHeader,
    ...rows,
    summaryRow,
  ];
};

export const exportTransactionToExcel = async (
  transactions,
  linenLabel,
  filterMonth
) => {
  try {
    const [{ utils, write }, fileSaver] = await Promise.all([
      import("xlsx"),
      import("file-saver"),
    ]);

    const data = createTransactionExcelData(
      transactions,
      linenLabel,
      filterMonth
    );

    const worksheet = utils.aoa_to_sheet(data);

    // merge หัวข้อ
    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } },
      { s: { r: 2, c: 0 }, e: { r: 2, c: 7 } },
    ];

    worksheet["!cols"] = [
      { wch: 15 },
      { wch: 25 },
      { wch: 15 },
      { wch: 10 },
      { wch: 10 },
      { wch: 15 },
      { wch: 20 },
      { wch: 20 },
    ];

    const workbook = {
      Sheets: { data: worksheet },
      SheetNames: ["data"],
    };

    const excelBuffer = write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const fileName = `รายงาน_${linenLabel || "ทั้งหมด"}.xlsx`;

    const blob = new Blob([excelBuffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    fileSaver.default.saveAs(blob, fileName);
  } catch (error) {
    console.error(error);
    alert("เกิดข้อผิดพลาดในการ export");
  }
};