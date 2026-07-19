import { useState, type FormEvent } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { TextField } from '@/components/ui/TextField'
import { TextArea } from '@/components/ui/TextArea'
import { Banner } from '@/components/ui/Banner'
import { extractErrorMessage, extractFieldErrors } from '@/lib/api'
import { useCreateAgent } from './useCreateAgent'

interface CreateAgentModalProps {
  clientId: number
  open: boolean
  onClose: () => void
  onCreated: (name: string) => void
}

export function CreateAgentModal({ clientId, open, onClose, onCreated }: CreateAgentModalProps) {
  const createAgent = useCreateAgent(clientId)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)

  function reset() {
    setName('')
    setDescription('')
    setFieldErrors({})
    setFormError(null)
  }

  function handleClose() {
    reset()
    onClose()
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFieldErrors({})
    setFormError(null)
    try {
      await createAgent.mutateAsync({ name: name.trim(), description: description.trim() || undefined })
      onCreated(name.trim())
      reset()
    } catch (err) {
      const fields = extractFieldErrors(err)
      if (Object.keys(fields).length > 0) {
        setFieldErrors(fields)
      } else {
        setFormError(extractErrorMessage(err, 'Não foi possível cadastrar o agente.'))
      }
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Novo agente"
      description="Cadastre um agente de IA para este cliente."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-6 py-5" noValidate>
        {formError && (
          <Banner tone="danger" role="alert">
            {formError}
          </Banner>
        )}

        <TextField
          label="Nome do agente"
          placeholder="Ex.: Suporte N1"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={fieldErrors.name}
          data-autofocus
          required
        />
        <TextArea
          label="Descrição"
          placeholder="O que este agente faz? (opcional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          error={fieldErrors.description}
          hint="Ajuda o time de CS a entender o papel do agente."
        />

        <div className="mt-1 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" loading={createAgent.isPending}>
            Cadastrar agente
          </Button>
        </div>
      </form>
    </Modal>
  )
}
