import Button from '@/components/atoms/Button'
import Modal from '@/components/templates/Modal'
import DELETE_MEMBER from '@/helpers/graphql/mutations/delete_member'
import { errorNotify, successNotify } from '@/helpers/toast'
import { useMutation } from '@apollo/client'
import { useState } from 'react'
import { HiTrash } from 'react-icons/hi'

type Props = {
    id: number
    name: string
    role: string | undefined
    refetchHandler: (isDelete: boolean) => void
}

const RemoveMember = ({ id, name, role, refetchHandler }: Props): JSX.Element => {
    const [isOpenDelete, setIsOpenDelete] = useState(false)
    const [deleteMember] = useMutation(DELETE_MEMBER)

    const closeDelete = (): void => {
        setIsOpenDelete(!isOpenDelete)
    }

    const onSubmit = (): void => {
        deleteMember({
            variables: {
                id,
            },
        })
            .then(() => {
                successNotify('Member removed successfully!')
                refetchHandler(true)
                closeDelete()
            })
            .catch(() => {
                errorNotify('There was an error removing the member!')
            })
    }

    return (
        <div>
            <Button
                usage="toggle-modal"
                onClick={() => {
                    setIsOpenDelete(true)
                }}
            >
                <HiTrash className="text-xl text-primary-red" />
            </Button>
            {isOpenDelete && (
                <Modal
                    title={`Remove ${name}`}
                    submitLabel="Confirm"
                    isOpen={isOpenDelete}
                    handleClose={closeDelete}
                    handleSubmit={onSubmit}
                >
                    Are you sure you want to remove this member?
                </Modal>
            )}
        </div>
    )
}

export default RemoveMember
