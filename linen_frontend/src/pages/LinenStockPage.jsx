import React, { useState, useEffect } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Tag } from 'primereact/tag';
import { Card } from 'primereact/card';

const LinenStockPage = () => {
    // ข้อมูลจำลอง
    const [products, setProducts] = useState([
        { id: 1, date: '2024-03-20', detail: 'ซื้อมา', type: 'IN', price: 5000, receive: 100, pay: 0, balance: 100, payer: 'บริษัท A', receiver: 'คลังสินค้า' },
        { id: 2, date: '2024-03-21', detail: 'บริจาค', type: 'OUT', price: 0, receive: 0, pay: 20, balance: 80, payer: 'คลังสินค้า', receiver: 'มูลนิธิ B' },
        { id: 3, date: '2024-03-22', detail: 'ซื้อมา', type: 'IN', price: 2500, receive: 50, pay: 0, balance: 130, payer: 'บริษัท C', receiver: 'คลังสินค้า' },
    ]);

    const [globalFilter, setGlobalFilter] = useState('');

    // ฟอร์แมตตัวเลขราคา
    const formatCurrency = (value) => {
        return value.toLocaleString('th-TH', { style: 'currency', currency: 'THB' });
    };

    // แสดงสถานะ ซื้อมา/บริจาค ด้วย Tag
    const detailBodyTemplate = (rowData) => {
        return <Tag value={rowData.detail} severity={rowData.type === 'IN' ? 'success' : 'warning'} />;
    };

    const header = (
        <div className="flex flex-column md:flex-row md:justify-content-between md:align-items-center gap-2">
            <h2 className="m-0 text-xl font-bold text-gray-800">ระบบจัดการสต็อกผ้า</h2>
            <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText 
                    type="search" 
                    onInput={(e) => setGlobalFilter(e.target.value)} 
                    placeholder="ค้นหาข้อมูล..." 
                    className="p-inputtext-sm"
                />
            </span>
        </div>
    );

    return (
        <div className="p-4 bg-gray-50 min-h-screen">
            <Card className="shadow-sm border-round-xl">
                <DataTable 
                    value={products} 
                    header={header} 
                    globalFilter={globalFilter}
                    responsiveLayout="stack" 
                    breakpoint="960px"
                    paginator 
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25]}
                    className="p-datatable-sm"
                    stripedRows
                    tableStyle={{ minWidth: '60rem' }}
                >
                    <Column field="date" header="วันที่" sortable className="font-medium"></Column>
                    <Column header="รายละเอียด" body={detailBodyTemplate} sortable></Column>
                    <Column field="price" header="ราคา" body={(row) => formatCurrency(row.price)} sortable></Column>
                    <Column field="receive" header="รับ (หลา/ม้วน)" sortable className="text-green-600 font-bold"></Column>
                    <Column field="pay" header="จ่าย (หลา/ม้วน)" sortable className="text-red-600 font-bold"></Column>
                    <Column field="balance" header="คงเหลือ" sortable className="bg-blue-50 font-bold text-blue-700 text-center"></Column>
                    <Column field="payer" header="ผู้จ่าย" sortable></Column>
                    <Column field="receiver" header="ผู้รับ" sortable></Column>
                </DataTable>
            </Card>
        </div>
    );
};

export default LinenStockPage;