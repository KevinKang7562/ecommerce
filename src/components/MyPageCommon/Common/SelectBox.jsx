import React from 'react';

//ui만 담당하는 컴포넌트 + 실제 상태 변경은 부모에서 처리
//props 설명
//label : 셀렉트 박스 이름
//options 배열 : 셀렉트 박스 안에 들어갈 옵션 목록 (opt.value : 실제 서버로 보내지는 값, opt.label : 화면에 보이는 옵션명)
// value : 현재 선택된 값
// onChange : 사용자가 선택값 변경 시 실행될 함수
function SelectBox({ label, options = [], value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-base font-medium">{label}</label>}
      <select
        className="border border-gray-300 rounded px-2 py-1 min-w-[160px]"
        value={value}
        onChange={onChange}
      >
        {console.log('SelectBox options:', options)}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default SelectBox;
