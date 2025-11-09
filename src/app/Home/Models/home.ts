
export interface NavItem {
  icon: string;
  key: string; // Use key for translation
  route: string;
}

export interface DashboardCard {
  key: string; // Use key for translation
  value: string;
  icon: string;
  color: string;
  change: string;
}

 export interface Activity {
  timeKey: string; // Use key for translation
  descriptionKey: string; // Use key for translation
}

export interface Employee {
  id: number;
  name: string;
  title: string;
  department: string;
  status: 'Active' | 'On Leave' | 'Terminated';
  email: string;
}


