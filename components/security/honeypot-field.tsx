"use client";

/** Görünmez bot tuzağı — gerçek kullanıcılar doldurmaz */
export function HoneypotField() {
  return (
    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label htmlFor="_hp">Website</label>
      <input
        id="_hp"
        name="_hp"
        type="text"
        tabIndex={-1}
        autoComplete="off"
        defaultValue=""
      />
    </div>
  );
}
