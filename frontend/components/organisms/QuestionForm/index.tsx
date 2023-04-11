import Button from '@/components/atoms/Button'
import FormAlert from '@/components/molecules/FormAlert'
import RichTextEditor from '@/components/molecules/RichTextEditor'
import SortDropdown from '@/components/molecules/SortDropdown'
import type { FilterType } from '@/components/templates/QuestionsPageLayout'
import CREATE_QUESTION from '@/helpers/graphql/mutations/create_question'
import UPDATE_QUESTION from '@/helpers/graphql/mutations/update_question'
import { GET_TAG_SUGGESTIONS } from '@/helpers/graphql/queries/sidebar'
import { loadingScreenShow } from '@/helpers/loaderSpinnerHelper'
import { useBoundStore } from '@/helpers/store'
import { errorNotify, successNotify } from '@/helpers/toast'
import type { TeamType } from '@/pages/questions/[slug]'
import { isObjectEmpty } from '@/utils'
import { useMutation, useQuery } from '@apollo/client'
import { yupResolver } from '@hookform/resolvers/yup'
import { Checkbox } from '@material-tailwind/react'
import isEqual from 'lodash/isEqual'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { HiGlobeAlt } from 'react-icons/hi2'
import type { ITag } from '../../molecules/TagsInput'
import TagsInput from '../../molecules/TagsInput'
import QuestionFormSchema from './schema'
export type FormValues = {
    title: string
    description: string
    tags: ITag[]
    team_id?: number | null
    is_public?: boolean
}

type QuestionSkeleton = {
    id: number | undefined
    content: string
    title: string
    tags: ITag[]
    slug: string
    team?: TeamType
    is_public?: boolean
}
interface Props {
    initialState?: QuestionSkeleton
}

const QuestionForm = ({ initialState }: Props): JSX.Element => {
    let id: number | undefined
    let title: string | undefined
    let content: string | undefined
    let tags: ITag[] | undefined
    let is_public: boolean | undefined
    let team: TeamType | undefined

    if (initialState) {
        ;({ id, content, title, tags, is_public, team } = initialState)
    }

    const router = useRouter()
    const queryTeamId = isNaN(parseInt(router.query.id as string))
        ? undefined
        : parseInt(router.query.id as string)
    let buttonText = 'Post Question'
    let successMessage = 'Question Added Successfully'
    const errorMessage = 'Question Not Updated'
    if (router.query.slug) {
        buttonText = 'Save Edits'
        successMessage = 'Question Updated Successfully'
    }
    const {
        register,
        handleSubmit,
        control,
        setValue,
        watch,
        formState: { errors },
    } = useForm<FormValues>({
        defaultValues: {
            title: title ? String(title) : '',
            description: content ? String(content) : '',
            tags: tags ?? [],
            is_public: is_public ?? true,
            team_id: team?.id ?? queryTeamId,
        },
        mode: 'onSubmit',
        reValidateMode: 'onSubmit',
        resolver: yupResolver(QuestionFormSchema),
    })
    const hasTeam = watch('team_id')

    let initial_team_name
    initial_team_name = team ? team.name : ''
    initial_team_name = initial_team_name || (router.query.team ?? 'Select Teams')

    const [createQuestion] = useMutation(CREATE_QUESTION)
    const [updateQuestion] = useMutation(UPDATE_QUESTION)
    const [selectedFilter, setSelectedFilter] = useState(initial_team_name)

    const {
        data,
        loading: tagLoading,
        error,
        refetch,
    } = useQuery(GET_TAG_SUGGESTIONS, {
        variables: { queryString: `%%` },
    })

    if (tagLoading) return loadingScreenShow()
    if (error) {
        errorNotify(`Error! ${error.message}`)
        return <></>
    }

    const refetchTags = async (queryText: string): Promise<void> => {
        await refetch({ queryString: `%${queryText}%` })
    }

    const tagSuggest = data.tagSuggest

    const tempTeams = useBoundStore.getState().teams

    const transformTeams = (): FilterType[] => {
        const teamFilters: FilterType[] = tempTeams.map(({ team: { id, name } }) => {
            return {
                id,
                name,
                onClick: () => {
                    setValue('team_id', id)
                    setValue('is_public', true)
                    setSelectedFilter(name)
                },
            }
        })

        teamFilters.unshift({
            id: 0,
            name: 'No Team',
            onClick: () => {
                setValue('team_id', undefined)
                setValue('is_public', true)
                setSelectedFilter('No Team')
            },
        })

        return teamFilters
    }

    const validateChanges = (data: FormValues): boolean => {
        if (data.title !== initialState?.title) {
            return false
        }
        if (data.description !== initialState?.content) {
            return false
        }
        if (data.is_public !== initialState?.is_public) {
            return false
        }
        if (data?.team_id !== initialState?.team?.id) {
            return false
        }
        if (
            !isEqual(
                data.tags.map((tag) => Number(tag.id)),
                initialState.tags.map((tag) => Number(tag.id))
            )
        ) {
            return false
        }
        return true
    }

    const onSubmit = async (data: FormValues): Promise<void> => {
        const tags = data.tags.map((tag) => tag.id)
        if (initialState?.slug && validateChanges(data)) {
            await router.replace(`/questions/${initialState.slug}`)
            errorNotify(errorMessage)
            return
        }
        if (id) {
            await updateQuestion({
                variables: {
                    id,
                    title: data.title,
                    content: data.description,
                    is_public: data.is_public,
                    tags,
                    team_id: data?.team_id,
                },
            })
                .then(async (data) => {
                    let slug: string
                    if (id) {
                        slug = data.data.updateQuestion.slug
                    } else {
                        slug = data.data.createQuestion.slug
                    }

                    if (router.query.prev === undefined) {
                        if (initialState?.slug !== undefined) {
                            await router.push(
                                String(router.asPath).replace(
                                    `${initialState?.slug}/edit`,
                                    `${slug}`
                                )
                            )
                        } else {
                            await router.push(String(router.asPath).replace(`add`, `${slug}`))
                        }
                    } else {
                        await router.push(`/teams/${router.query.prev as string}/question/${slug}`)
                    }
                })
                .catch(() => {})
        } else {
            await createQuestion({
                variables: {
                    title: data.title,
                    content: data.description,
                    is_public: data.is_public,
                    tags,
                    team_id: data.team_id,
                },
            })
                .then(async (data) => {
                    let slug: string
                    if (id) {
                        slug = data.data.updateQuestion.slug
                    } else {
                        slug = data.data.createQuestion.slug
                    }

                    if (router.query.prev === undefined) {
                        if (initialState?.slug !== undefined) {
                            await router.push(
                                String(router.asPath).replace(
                                    `${initialState?.slug}/edit`,
                                    `${slug}`
                                )
                            )
                        } else {
                            await router.push(String(router.asPath).replace(`add`, `${slug}`))
                        }
                    } else {
                        await router.push(`/teams/${router.query.prev as string}/question/${slug}`)
                    }
                })
                .catch(() => {})
        }

        successNotify(successMessage)
    }
    return (
        <div className="w-[1204px]">
            <form className="flex flex-col space-y-[30px]" onSubmit={handleSubmit(onSubmit)}>
                <div className="QuestionTitle w-full space-y-[10px] self-center">
                    <label htmlFor="titleInput" className="mt-[10px] text-2xl text-primary-black">
                        Question Title
                    </label>
                    <input
                        id="titleInput"
                        type="text"
                        className={` w-full rounded-lg border border-[#EEEEEE] bg-white`}
                        {...register('title', {})}
                    />
                </div>
                <div className="Description mb-[30px] w-full space-y-[10px] self-center">
                    <label htmlFor="descriptionInput" className="mb-10 text-2xl text-primary-black">
                        Description
                    </label>
                    <Controller
                        control={control}
                        name="description"
                        render={({ field: { onChange, value } }) => (
                            <RichTextEditor
                                onChange={onChange}
                                value={value}
                                usage="description"
                                id="descriptionInput"
                            />
                        )}
                    />
                </div>
                <div className="flex w-full flex-row  space-x-10">
                    <div className="Tags w-1/2 self-center">
                        <label htmlFor="tagsInput" className="mb-2.5 text-2xl">
                            Tags (max. 5)
                        </label>
                        <Controller
                            control={control}
                            name="tags"
                            render={({ field: { value } }) => (
                                <TagsInput
                                    setValue={setValue}
                                    value={value}
                                    suggestions={tagSuggest}
                                    refetchSuggestions={refetchTags}
                                />
                            )}
                        />
                    </div>
                </div>
                <div className="flex w-full flex-col">
                    <label className="mb-2.5 w-full text-2xl">Privacy</label>
                    <div className="flex flex-row ">
                        <div className="mr-[30px]">
                            <Controller
                                control={control}
                                name="team_id"
                                render={({ field: { value } }) => {
                                    const teams = transformTeams()

                                    return (
                                        <SortDropdown
                                            filters={teams}
                                            selectedFilter={String(selectedFilter)}
                                        />
                                    )
                                }}
                            />
                        </div>
                        <div className="flex flex-row">
                            <label htmlFor="isPublic" className="text-2xl font-bold">
                                <HiGlobeAlt size={40} color="#333333" />
                            </label>
                            <div className="">
                                <Checkbox
                                    {...register('is_public')}
                                    id="isPublic"
                                    disabled={!hasTeam}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {!isObjectEmpty(errors) && <FormAlert errors={errors} />}
                <div className="Submit w-full self-center py-4">
                    <div className="float-right">
                        <Button usage="question-form" type="submit" onClick={undefined}>
                            {buttonText}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default QuestionForm
