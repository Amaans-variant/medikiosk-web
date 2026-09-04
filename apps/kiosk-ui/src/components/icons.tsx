import React from "react";
import { cn } from "@/lib/utils";

export type IconProps = React.SVGProps<SVGSVGElement>;

// Anatomically accurate medical-grade SVG icons for MediKiosk
// Clean lines, proper anatomical markers, dual-tone (#1A5276 primary, #148F77 teal, #E74C3C coral alert)

// 1. Head & Brain (सिर / क्रेनियम) - Cranial outline with frontal/temporal pain loci
export function HeadAnatomyIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-full h-full", className)} {...props}>
      {/* Cranium & Facial Silhouette */}
      <path 
        d="M32 8C20.5 8 15 15.5 14 25C13 32 15 36 15 39L18 41L19 46H28L29 42C33 42 37 39 39 35C41 31 43 23 41 16C39 10.5 36 8 32 8Z" 
        fill="#EBF5FB" 
        stroke="#1A5276" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      {/* Brain convolution contours */}
      <path d="M22 17C24 15 28 15 30 17C32 19 35 18 36 15" stroke="#1A5276" strokeWidth="1.8" strokeLinecap="round" opacity="0.6"/>
      <path d="M20 23C23 21 26 23 29 21C32 19 35 22 37 21" stroke="#1A5276" strokeWidth="1.8" strokeLinecap="round" opacity="0.6"/>
      {/* Temporal pain focal point */}
      <circle cx="26" cy="22" r="3.5" fill="#E74C3C" />
      <circle cx="26" cy="22" r="7" stroke="#E74C3C" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.7" />
      <circle cx="26" cy="22" r="11" stroke="#E74C3C" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
      {/* Cervical vertebrae junction */}
      <path d="M20 46V54M27 46V54" stroke="#1A5276" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

// 2. Chest, Heart & Lungs (छाती / हृदय एवं फेफड़े) - Anatomical lungs with heart silhouette
export function ChestHeartLungsIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-full h-full", className)} {...props}>
      {/* Trachea & Main Bronchi */}
      <path d="M32 6V22M32 22L24 28M32 22L40 28" stroke="#1A5276" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M29 10H35M29 14H35M29 18H35" stroke="#1A5276" strokeWidth="1.8" strokeLinecap="round"/>
      {/* Left Lung (Anatomical Right) */}
      <path 
        d="M23 28C17 29 12 34 11 42C10 49 14 54 20 54C24 54 26 50 27 46V30L23 28Z" 
        fill="#EBF5FB" 
        stroke="#1A5276" 
        strokeWidth="2.5" 
        strokeLinejoin="round"
      />
      {/* Right Lung with Cardiac Notch */}
      <path 
        d="M41 28C47 29 52 34 53 42C54 49 50 54 44 54C38 54 37 47 37 43V30L41 28Z" 
        fill="#EBF5FB" 
        stroke="#1A5276" 
        strokeWidth="2.5" 
        strokeLinejoin="round"
      />
      {/* Anatomical Heart Focal Area */}
      <path 
        d="M32 34C30 31 26 31 25 34C23.5 37 27 41 32 45C37 41 40.5 37 39 34C38 31 34 31 32 34Z" 
        fill="#E74C3C" 
        stroke="#154360" 
        strokeWidth="1.5"
      />
      {/* Bronchial tree branches */}
      <path d="M19 36L15 42M21 44L17 48M45 36L49 42M43 44L47 48" stroke="#148F77" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  );
}

// 3. Stomach & Abdomen (पेट / पाचन तंत्र) - Esophagus, gastric pouch, duodenum, and intestines
export function StomachDigestiveIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-full h-full", className)} {...props}>
      {/* Esophagus */}
      <path d="M29 6V16" stroke="#1A5276" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Stomach Curvature (Fundus, Greater & Lesser Curvature) */}
      <path 
        d="M29 16C23 16 16 20 16 28C16 38 24 42 34 42C43 42 46 35 46 29C46 22 41 18 35 18C33 18 31 16 29 16Z" 
        fill="#EBF5FB" 
        stroke="#1A5276" 
        strokeWidth="2.5" 
        strokeLinejoin="round"
      />
      {/* Gastric Acid / Pain Wave indicator */}
      <path 
        d="M22 28C25 25 28 29 32 27C36 25 39 28 41 26" 
        stroke="#E67E22" 
        strokeWidth="2.2" 
        strokeLinecap="round"
      />
      <circle cx="30" cy="33" r="3" fill="#E67E22" opacity="0.8"/>
      {/* Intestinal Loop (Lower GI) */}
      <path 
        d="M22 47C20 49 20 54 25 54C30 54 30 50 35 50C40 50 40 54 44 54" 
        stroke="#148F77" 
        strokeWidth="2.2" 
        strokeLinecap="round"
      />
    </svg>
  );
}

// 4. Back & Spine (पीठ / रीढ़ की हड्डी) - Anatomical vertebral column & lumbar pain
export function SpineBackIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-full h-full", className)} {...props}>
      {/* Torso Contour (Rear View) */}
      <path 
        d="M16 12C21 16 24 20 24 28V52M48 12C43 16 40 20 40 28V52" 
        stroke="#1A5276" 
        strokeWidth="1.8" 
        strokeLinecap="round" 
        opacity="0.4"
      />
      {/* Cervical & Thoracic Vertebrae */}
      <rect x="28" y="8" width="8" height="4" rx="1.5" fill="#EBF5FB" stroke="#1A5276" strokeWidth="2"/>
      <rect x="27.5" y="14" width="9" height="4.5" rx="1.5" fill="#EBF5FB" stroke="#1A5276" strokeWidth="2"/>
      <rect x="27" y="20.5" width="10" height="5" rx="1.5" fill="#EBF5FB" stroke="#1A5276" strokeWidth="2"/>
      <rect x="26.5" y="27.5" width="11" height="5" rx="1.5" fill="#EBF5FB" stroke="#1A5276" strokeWidth="2"/>
      {/* Lumbar & Sacrum Vertebrae (Highlighted Pain Site) */}
      <rect x="26" y="34.5" width="12" height="5.5" rx="1.5" fill="#FDEDEC" stroke="#E74C3C" strokeWidth="2"/>
      <rect x="25.5" y="42" width="13" height="6" rx="1.5" fill="#FDEDEC" stroke="#E74C3C" strokeWidth="2"/>
      {/* Sacrum & Coccyx */}
      <path d="M27 50L32 58L37 50H27Z" fill="#EBF5FB" stroke="#1A5276" strokeWidth="2"/>
      {/* Nerve radiculopathy waves */}
      <path d="M22 37L16 40M22 45L15 49M42 37L48 40M42 45L49 49" stroke="#E74C3C" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

// 5. Knee & Joints (घुटने / संधि) - Femur, Patella, Tibia/Fibula with cartilage capsule
export function KneeJointIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-full h-full", className)} {...props}>
      {/* Femur (Thigh bone) */}
      <path 
        d="M24 6H38V22C38 25 43 27 43 32C43 36 39 38 36 38H28C25 38 21 36 21 32C21 27 24 25 24 22V6Z" 
        fill="#EBF5FB" 
        stroke="#1A5276" 
        strokeWidth="2.5" 
        strokeLinejoin="round"
      />
      {/* Patella (Knee Cap) */}
      <ellipse cx="40" cy="35" rx="4" ry="6" fill="#FDEDEC" stroke="#E74C3C" strokeWidth="2"/>
      {/* Tibia & Fibula (Shin bones) */}
      <path 
        d="M26 43C28 43 31 42 33 42C36 42 38 43 40 43V58H26V43Z" 
        fill="#EBF5FB" 
        stroke="#1A5276" 
        strokeWidth="2.5" 
        strokeLinejoin="round"
      />
      <path d="M43 45V58" stroke="#1A5276" strokeWidth="2" strokeLinecap="round"/>
      {/* Synovial Joint space & Arthritis pain bursts */}
      <line x1="22" y1="40.5" x2="38" y2="40.5" stroke="#E74C3C" strokeWidth="2.5" strokeLinecap="round"/>
      <path d="M47 31L53 28M48 36L55 36M47 41L53 44" stroke="#E74C3C" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

// 6. Throat & Neck (गला एवं श्वासनली) - Larynx, thyroid cartilage, trachea
export function ThroatNeckIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-full h-full", className)} {...props}>
      {/* Mandible & Neck Contour */}
      <path 
        d="M16 10C22 14 24 20 22 42L14 54M48 10C42 14 40 20 42 42L50 54" 
        stroke="#1A5276" 
        strokeWidth="2" 
        strokeLinecap="round"
      />
      {/* Larynx / Adam's Apple */}
      <path d="M28 20L32 16L36 20L32 25L28 20Z" fill="#FDEDEC" stroke="#E74C3C" strokeWidth="2"/>
      {/* Thyroid Butterfly Gland */}
      <path 
        d="M26 27C22 24 19 28 22 34C24 38 29 36 32 31C35 36 40 38 42 34C45 28 42 24 38 27C35 29 33 28 32 28C31 28 29 29 26 27Z" 
        fill="#EBF5FB" 
        stroke="#1A5276" 
        strokeWidth="2"
      />
      {/* Tracheal Rings */}
      <path d="M28 39H36M28 44H36M28 49H36" stroke="#148F77" strokeWidth="2" strokeLinecap="round"/>
      {/* Sore throat inflammation radiates */}
      <circle cx="32" cy="22" r="7" stroke="#E74C3C" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.8"/>
    </svg>
  );
}

// 7. Arms, Shoulder & Hands (कंधा, हाथ एवं कलाई) - Shoulder rotator cuff down to wrist
export function ArmShoulderIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-full h-full", className)} {...props}>
      {/* Clavicle & Shoulder Acromion */}
      <path d="M12 18C18 16 28 16 32 20" stroke="#1A5276" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Shoulder Joint Socket (Rotator Cuff Pain Site) */}
      <circle cx="32" cy="22" r="5" fill="#FDEDEC" stroke="#E74C3C" strokeWidth="2"/>
      {/* Humerus (Upper Arm) */}
      <path d="M33 27L38 40" stroke="#1A5276" strokeWidth="4" strokeLinecap="round"/>
      {/* Elbow Joint */}
      <circle cx="39" cy="42" r="3" fill="#EBF5FB" stroke="#1A5276" strokeWidth="2"/>
      {/* Forearm (Radius & Ulna) to Wrist */}
      <path d="M41 44L49 54" stroke="#1A5276" strokeWidth="3.5" strokeLinecap="round"/>
      <circle cx="51" cy="56" r="2.5" fill="#148F77"/>
      {/* Radiating joint ache waves */}
      <path d="M26 15L23 10M32 14L32 8M38 16L43 12" stroke="#E74C3C" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

// 8. General Fever & Vitals (बुखार एवं संपूर्ण शरीर) - Clinical thermometer & vascular pulse
export function FeverVitalsIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-full h-full", className)} {...props}>
      {/* Whole Body Silhouette */}
      <circle cx="32" cy="14" r="6" fill="#EBF5FB" stroke="#1A5276" strokeWidth="2"/>
      <path d="M22 24C26 22 38 22 42 24V40H38V56H26V40H22V24Z" fill="#EBF5FB" stroke="#1A5276" strokeWidth="2" strokeLinejoin="round"/>
      {/* Clinical Mercury Thermometer */}
      <g transform="translate(14, 8) rotate(-25)">
        <rect x="30" y="4" width="6" height="32" rx="3" fill="#FFFFFF" stroke="#154360" strokeWidth="2"/>
        <circle cx="33" cy="38" r="5.5" fill="#E74C3C" stroke="#154360" strokeWidth="2"/>
        <path d="M33 16V34" stroke="#E74C3C" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="32" y1="12" x2="35" y2="12" stroke="#154360" strokeWidth="1.5"/>
        <line x1="32" y1="16" x2="35" y2="16" stroke="#154360" strokeWidth="1.5"/>
        <line x1="32" y1="20" x2="35" y2="20" stroke="#154360" strokeWidth="1.5"/>
      </g>
      {/* Heat convection waves */}
      <path d="M12 28C10 32 10 36 12 40M52 28C54 32 54 36 52 40" stroke="#E67E22" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

// Universal Mic Icon
export function MicIcon({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("w-full h-full", className)} {...props}>
      <rect x="9" y="3" width="6" height="11" rx="3" fill="#148F77" stroke="#1A5276" strokeWidth="1.5" />
      <path d="M5 11V12C5 15.866 8.13401 19 12 19C15.866 19 19 15.866 19 12V11" stroke="#1A5276" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 19V22" stroke="#1A5276" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M9 22H15" stroke="#1A5276" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
