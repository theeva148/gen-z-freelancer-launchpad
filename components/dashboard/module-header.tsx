export function ModuleHeader({
  title,
  subtitle,
  description,
  action,
}: {
  title: string
  subtitle?: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
          {title}
        </h1>
        <p className="mt-1 text-pretty text-sm text-muted-foreground">
          {subtitle ?? description}
        </p>
      </div>
      {action}
    </div>
  )
}
