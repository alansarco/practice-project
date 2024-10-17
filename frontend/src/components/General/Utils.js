export const genderSelect = [
      { value: "M", desc: "Male" },
      { value: "F", desc: "Female" }
];

export const gradeSelect = [
      { value: 7, desc: "Grade 7" },
      { value: 8, desc: "Grade 8" },
      { value: 9, desc: "Grade 9" },
      { value: 10, desc: "Grade 10" },
      { value: 11, desc: "Grade 11" },
      { value: 12, desc: "Grade 12" },
];

export const juniorSelect = [
      { value: 7, desc: "Grade 7" },
      { value: 8, desc: "Grade 8" },
      { value: 9, desc: "Grade 9" },
      { value: 10, desc: "Grade 10" },
];

export const seniorSelect = [
      { value: 11, desc: "Grade 11" },
      { value: 12, desc: "Grade 12" },
];

export const roleSelect = [
      { value: 10, desc: "Admin" },
      { value: 999, desc: "Super Admin" },
];

export const participantSelect = [
      { value: "7,8,9,10,11,12", desc: "All Students" },
      { value: "7,8,9,10", desc: "All JHS" },
      { value: "11,12", desc: "All SHS" },
      { value: "7", desc: "Grade 7" },
      { value: "8", desc: "Grade 8" },
      { value: "9", desc: "Grade 9" },
      { value: "10", desc: "Grade 10" },
      { value: "11", desc: "Grade 11" },
      { value: "12", desc: "Grade 12" },
];

export const trackSelect = [
      { value: "ACADEMIC", desc: "ACADEMIC" },
      { value: "TECH-VOCATIONAL", desc: "TECH-VOCATIONAL" },
];

export const modalitySelect = [
      { value: "FACE TO FACE", desc: "FACE TO FACE" },
      { value: "BLENDEND LEARNING", desc: "BLENDEND LEARNING" },
      { value: "MODULAR", desc: "MODULAR" },
];

export const courseSelect = [
      { group: "ACADEMIC", value: "STEM", desc: "STEM" },
      { group: "ACADEMIC", value: "HUMSS", desc: "HUMSS" },
      { group: "TECH-VOCATIONAL", value: "GARMENTS", desc: "GARMENTS" },
      { group: "TECH-VOCATIONAL", value: "COOKERY", desc: "COOKERY" },
      { group: "TECH-VOCATIONAL", value: "SMAW", desc: "SMAW" },
];

export const colorSelect = [
      { value: "success", desc: "Green" },
      { value: "primary", desc: "Red" },
      { value: "warning", desc: "Yellow" },
      { value: "info", desc: "Blue" },
      { value: "dark", desc: "Dark" },
];


const currentYear = new Date().getFullYear();
export const years = Array.from({ length: currentYear - 1899 }, (_, index) => currentYear - index);

export const currentDate = new Date().toISOString().split('T')[0];
    
export function isEmpty(obj) {
      if (obj === null || obj === undefined) return true;
    
      if (Array.isArray(obj) || typeof obj === 'string') {
            return obj.length === 0;
      }
    
      if (typeof obj === 'object') {
            return Object.keys(obj).length === 0;
      }
    
      return false;
};
    