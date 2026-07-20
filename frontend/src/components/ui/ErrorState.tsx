import { Banner } from './Banner'
import { AlertIcon } from '@/components/icons'

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Banner tone="danger" role="alert" className="items-center">
      <AlertIcon className="h-4 w-4 shrink-0" />
      <span className="flex-1">{message}</span>
      <button type="button" onClick={onRetry} className="font-semibold underline underline-offset-2">
        Tentar de novo
      </button>
    </Banner>
  )
}
