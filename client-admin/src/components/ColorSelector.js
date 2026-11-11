import React, { useState } from "react";
import { COLORS } from "../constants/productOptions";

const getColorStyle = (color) => {
  const cssColor = color.replace(/\s+/g, "");
  const valid = typeof CSS !== "undefined" && CSS.supports("color", cssColor);
  return { background: valid ? cssColor : "#e5e7eb" };
};

const ColorSelector = ({ colors, onChange }) => {
  const [newColor, setNewColor] = useState("");

  const addColor = (event) => {
    event.preventDefault();
    const color = newColor.trim();
    if (!color || colors.some((item) => item.toLowerCase() === color.toLowerCase())) return;
    onChange([...colors, color]);
    setNewColor("");
  };

  const toggleColor = (color) => {
    onChange(
      colors.some((item) => item.toLowerCase() === color.toLowerCase())
        ? colors.filter((item) => item.toLowerCase() !== color.toLowerCase())
        : [...colors, color]
    );
  };

  return (
    <div>
      <label className="form-label d-block">Colors</label>
      <div className="d-flex flex-wrap gap-2 mb-3">
        {COLORS.map((color) => {
          const selected = colors.some((item) => item.toLowerCase() === color.toLowerCase());
          return (
            <button
              type="button"
              key={color}
              className={`color-swatch ${selected ? "selected" : ""}`}
              style={{ background: color.toLowerCase() }}
              title={color}
              aria-label={`${selected ? "Remove" : "Add"} ${color}`}
              aria-pressed={selected}
              onClick={() => toggleColor(color)}
            />
          );
        })}
      </div>
      <div className="d-flex gap-2 mb-3">
        <input
          className="form-control"
          value={newColor}
          onChange={(event) => setNewColor(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") addColor(event);
          }}
          placeholder="Type a color name or HEX (e.g. Sky Blue, #4A90E2)"
          aria-label="Custom product color"
        />
        <button type="button" className="btn btn-outline-primary" onClick={addColor}>Add</button>
      </div>
      {colors.length > 0 && (
        <div className="d-flex flex-wrap gap-2">
          {colors.map((color) => (
            <span className="color-label" key={color}>
              <span className="color-label-swatch" style={getColorStyle(color)} aria-hidden="true" />
              {color}
              <button
                type="button"
                className="color-label-remove"
                onClick={() => toggleColor(color)}
                aria-label={`Remove ${color}`}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default ColorSelector;
