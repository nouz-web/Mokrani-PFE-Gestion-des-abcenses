import Link from "next/link"
import Image from "next/image"

interface UserTypeCardProps {
  title: string
  description: string
  color: string
  icon: string
  href: string
}

export function UserTypeCard({ title, description, color, icon, href }: UserTypeCardProps) {
  const getBgColor = () => {
    switch (color) {
      case "blue":
        return "bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30"
      case "green":
        return "bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30"
      case "purple":
        return "bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30"
      case "red":
        return "bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30"
      default:
        return "bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800/70"
    }
  }

  const getBorderColor = () => {
    switch (color) {
      case "blue":
        return "border-blue-500 dark:border-blue-400"
      case "green":
        return "border-green-500 dark:border-green-400"
      case "purple":
        return "border-purple-500 dark:border-purple-400"
      case "red":
        return "border-red-500 dark:border-red-400"
      default:
        return "border-gray-500 dark:border-gray-400"
    }
  }

  return (
    <Link
      href={href}
      className={`block p-6 rounded-lg border-l-4 ${getBorderColor()} ${getBgColor()} transition-colors duration-200`}
    >
      <div className="flex flex-col items-center text-center">
        <div className="mb-4">
          <Image src={icon || "/placeholder.svg"} alt={`${title} icon`} width={64} height={64} />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
      </div>
    </Link>
  )
}
