const createLinenExcelData = (linenItems = []) => {
  const header = [
    ["รายงานรายการผ้า"],
    [`วันที่ออกรายงาน: ${new Date().toLocaleDateString("th-TH")}`],
    ["ED", "ชื่อรายการ", "หน่วย", "จำนวนสั่ง(ค่าเริ่มต้น)", "ราคา(ต่อหน่วย)"],
  ];

  const rows = linenItems.map((item) => [
    item.code || "",
    item.linen_name || "",
    item.unit || "",
    item.default_order_quantity ?? 0,
    item.price ?? 0,
  ]);

  const totalPrice = linenItems.reduce(
    (sum, item) =>
      sum + (item.default_order_quantity ?? 0) * (item.price ?? 0),
    0
  );

  const summaryRow = [
    "รวมมูลค่าโดยประมาณ",
    "",
    "",
    "",
    totalPrice.toLocaleString("th-TH"),
  ];

  return [...header, ...rows, [], summaryRow];
};

export const exportLinenItemsToExcel = async (linenItems = []) => {
  try {
    const XLSX = await import("xlsx");
    const fileSaver = await import("file-saver");

    const data = createLinenExcelData(linenItems);

    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // merge หัวรายงาน
    worksheet["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: 4 } },
    ];

    worksheet["!cols"] = [
      { wch: 12 },
      { wch: 30 },
      { wch: 15 },
      { wch: 20 },
      { wch: 18 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "LinenItems");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    fileSaver.default.saveAs(blob, "รายงานรายการผ้า.xlsx");
  } catch (error) {
    console.error(error);
    alert("เกิดข้อผิดพลาดในการ export");
  }
};