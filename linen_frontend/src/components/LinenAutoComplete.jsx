import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { AutoComplete } from "primereact/autocomplete";
const API_BASE =
  import.meta.env.VITE_REACT_APP_API || "http://localhost:3000/api";

export const LinenAutoComplete = ({ row, rowIndex, handleInputChange, id, className, invalid }) => {
  const [suggestions, setSuggestions] = useState([]);

  const searchLinen = async (event) => {
    try {
      const query = event?.query?.trim() || "";
      const res = await axios.get(`${API_BASE}/stock/linen-item/search`, {
        params: { q: query },
      });

      if (res.data?.success) {
        // อัปเดต state ของตัวเอง ไม่กวนใคร
        setSuggestions(res.data.data);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      setSuggestions([]);
    }
  };

  return (
    <AutoComplete
      value={row.linen_name}
      suggestions={suggestions} // ใช้ state ในนี้
      completeMethod={searchLinen}
      field="linen_name"
      dropdown
      inputId={id}
      className={`w-full ${className}`}
      inputClassName={className}
      invalid={invalid}
      onChange={(e) => {
        const value = e.value;
        if (typeof value === "string") {
          handleInputChange(rowIndex, "linen_name", value);
          handleInputChange(rowIndex, "linen_id", null);
        } else if (value) {
          handleInputChange(rowIndex, "linen_type", value.linen_type);
          handleInputChange(rowIndex, "code", value.code);
          handleInputChange(rowIndex, "linen_id", value.id);
          handleInputChange(rowIndex, "linen_name", value.linen_name);
          handleInputChange(rowIndex, "unit", value.unit);
          handleInputChange(rowIndex, "price", value.price);
          handleInputChange(
            rowIndex,
            "default_order_quantity",
            value.default_order_quantity,
          );
          handleInputChange(
            rowIndex,
            "default_issue_quantity",
            value.default_issue_quantity,
          );
        }
      }}
    />
  );
};
