import { ReactNode } from 'react';

export interface ContactSectionProps {
  title?: string;
  description?: string;
  buttonText?: string;
  imageSrc?: string;
  bgImageSrc?: string;
  doctorName?: string;
  isAboutPage?: boolean;
}

export interface ServiceFeature {
  icon: string;
  text: string;
}

export interface ServiceContent {
  title: string;
  description: string;
  image: string;
  features: ServiceFeature[];
}

export interface ServiceData {
  [key: string]: ServiceContent;
}
export interface UserReviewsProps {
  title?: string;
}

export interface CareCardProps {
  image: string;
  title: string;
  description: string;
  stat?: string;
  statText?: string;
  defaultExpanded?: boolean;
}

export interface CarouselProps {
  children: ReactNode;
}

export interface CustomDropdownProps {
  onChange?: (value: string) => void;
  value?: string;
}


export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQProps {
  title?: string;
  subtitle?: string;
  items: FAQItem[];
}

export interface NavbarProps {
  isTransparent?: boolean;
}

export interface TabItemProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export interface LinkButtonProps {
  href?: string; // optional: render a <button> when absent
  children: ReactNode;
  size?: LinkSize;
  animation?: LinkAnimation;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  onClick?: () => void;
  animationColor?: string;
  type?: 'button' | 'submit';
  disabled?: boolean;
}
export type LinkSize = 'sm' | 'md' | 'lg' | 'xl';
export type LinkAnimation = 'none' | 'shine' | 'scale';

// Unions for IDs and tabs used across data and components
export type StepId = 1 | 2 | 3;
export interface Step {
  id: StepId;
  title: string;
  img: string;
  icon: string;
  activeIcon: string;
}

export type ValueId = 1 | 2 | 3 | 4;
export interface Value {
  id: ValueId;
  icon: string;
  activeIcon: string;
  title: string;
  description: string;
}

export type ServiceTab =
  | 'Home Assistance'
  | 'Companionship'
  | 'Flexible Care Plans'
  | 'Personal Care Support'
  | 'Mobility & Safety'
  | 'Medication Reminders (Self-Administered)';

// Optional: strongly-typed map when indexing services by tab
export type ServiceDataByTab = Record<ServiceTab, ServiceContent>;



