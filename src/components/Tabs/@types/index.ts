export interface TabItem {
  value: string;
  label: string;
  labelFa?: string;
}

export interface TabsProps {
  items: TabItem[];
  defaultValue: string;
  children: React.ReactNode;
  onValueChange?: (value: string) => void;
}

export interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}
