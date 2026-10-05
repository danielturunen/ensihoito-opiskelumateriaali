import {
  ClipboardList,
  Wind,
  HeartPulse,
  Brain,
  Stethoscope,
  Droplet,
  FlaskConical,
  Bone,
  Baby,
  Heart,
  Bug,
  Pill,
  GraduationCap,
  HelpCircle,
  type LucideProps,
} from 'lucide-react'

// Explicit map (not `import *`) so Vite can tree-shake unused lucide icons out of the bundle.
const registry: Record<string, React.ComponentType<LucideProps>> = {
  ClipboardList,
  Wind,
  HeartPulse,
  Brain,
  Stethoscope,
  Droplet,
  FlaskConical,
  Bone,
  Baby,
  Heart,
  Bug,
  Pill,
  GraduationCap,
}

export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const Cmp = registry[name] ?? HelpCircle
  return <Cmp {...props} />
}
