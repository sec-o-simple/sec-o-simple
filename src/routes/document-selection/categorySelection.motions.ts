import { TargetAndTransition } from 'framer-motion'

export const MButtonInitial = {
  marginLeft: 20,
  marginRight: 20,
  borderRadius: 20,
  fontSize: '25px',
  padding: '2rem',
} as TargetAndTransition

const MButtonFinal = {
  borderRadius: 20,
  marginLeft: 0,
  marginRight: 0,
  marginTop: '2rem',
  fontSize: '0px',
  lineHeight: '0px',
  gap: 0,
  padding: '1rem',
} as TargetAndTransition

export const MButtonLeftFinal = {
  ...MButtonFinal,
  borderTopRightRadius: 0,
  borderBottomRightRadius: 0,
} as TargetAndTransition

export const MButtonRightFinal = {
  ...MButtonFinal,
  borderBottomLeftRadius: 0,
  borderTopLeftRadius: 0,
} as TargetAndTransition

export const MButtonIconInitial = {
  fontSize: '4rem',
} as TargetAndTransition

export const MButtonIconFinal = {
  fontSize: '1.5rem',
} as TargetAndTransition
