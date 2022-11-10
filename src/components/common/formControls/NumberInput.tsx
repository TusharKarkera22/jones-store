import { useEffect, useState } from "react";

export default function NumberInput({
  value = 0,
  min = 0,
  max = Infinity,
  className = "",
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  className?: string;
  onChange?: (value: number) => void;
}) {
  const { min: getMin, max: getMax } = Math;
  const [_value, setValue] = useState(getMin(getMax(value, min), max));

  useEffect(() => {
    setValue(value);
  }, [value]);

  useEffect(() => {
    if (value != _value) {
      onChange?.(_value);
    }
  }, [_value]);

  return (
    <div className={"number-input" + (className ? ` ${className}` : "")}>
      <button
        className="number-input__button"
        onClick={() => setValue(getMax(_value - 1, min))}
        type="button"
      >
        {" - "}
      </button>
      <input
        className="number-input__control"
        readOnly
        name="qty"
        key={_value}
        defaultValue={_value}
      />
      <button
        className="number-input__button"
        onClick={() => setValue(getMin(_value + 1, max))}
        type="button"
      >
        {" + "}
      </button>
    </div>
  );
}
