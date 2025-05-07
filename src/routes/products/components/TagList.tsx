import { Chip } from '@heroui/chip'

export default function TagList({ tags }: { tags: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Chip
          key={tag}
          className="rounded-md bg-content2 text-content2-foreground"
        >
          {tag}
        </Chip>
      ))}
    </div>
  )
}
