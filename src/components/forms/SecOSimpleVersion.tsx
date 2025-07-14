import pkg from '@/../package.json'

export default function SecOSimpleVersion() {
  return (
    <p className="text-center text-sm text-neutral-400">
      Version <span className="font-semibold">{pkg.version}</span>
    </p>
  )
}
