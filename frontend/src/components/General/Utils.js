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
      { value: 10, desc: "Adviser" },
      { value: 999, desc: "Super Admin" },
];

export const strictSelect = [
      { value: 1, desc: "Yes" },
      { value: 0, desc: "No" },
];

export const enrollStatus = [
      { value: 1, desc: "Yes" },
      { value: 0, desc: "No" },
];

export const yesnoSelect = [
      { value: 1, desc: "Yes" },
      { value: 0, desc: "No" },
];

export const enrolledSelect= [
      { value: 1, desc: "Enrolled" },
      { value: 0, desc: "Not Enrolled" },
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

export const programSelect = [
      { value: "REGULAR PROGRAM", desc: "REGULAR PROGRAM" },
      { value: "SPECIAL PROGRAM IN THE ARTS", desc: "SPECIAL PROGRAM IN THE ARTS" },
      { value: "SPECIAL PROGRAM IN SPORTS", desc: "SPECIAL PROGRAM IN SPORTS" },
      { value: "SCIENCE TECHNOLOGY & ENGINEERING PROGRAM", desc: "SCIENCE, TECHNOLOGY & ENGINEERING PROGRAM" },
      { value: "OPEN HIGH SCHOOL PROGRAM", desc: "OPEN HIGH SCHOOL PROGRAM" },
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

export const distributionSelect = [
      { value: 1, desc: "By Gender" },
      { value: 2, desc: "By Grade" },
];


const currentYear = new Date().getFullYear();
export const years = Array.from({ length: currentYear - 1899 }, (_, index) => currentYear - index);

export const currentDate = new Date(new Date().getTime() + 8 * 60 * 60 * 1000)
  .toISOString()
  .split('T')[0];

    
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
    