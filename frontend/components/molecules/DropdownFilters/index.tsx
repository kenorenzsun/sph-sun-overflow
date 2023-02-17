import { useState } from 'react'
import { number } from 'yup'
import SortDropdown from '../SortDropdown'

type RefetchType = {
    first: number
    page: number
    orderBy?: { column: string; order: string }[]
    filter?: string
}

type TriggerType = 'DATE' | 'ANSWER' | 'WATCHED' | 'POPULAR'

type FilterType = {
    state: string
    filters: {
        id: number
        name: string
        onClick: () => void
    }[]
}

type FilterTextsType = {
    DATE: { 1: string; 2: string }
    ANSWER: { 1: string; 2: string }
    WATCHED: { 1: string; 2: string }
    POPULAR: { 1: string; 2: string }
}

type FilterListsType = {
    DATE: FilterType
    ANSWER: FilterType
    WATCHED: FilterType
    POPULAR: FilterType
}

type Props = {
    refetch: ({ first, page, orderBy, filter }: RefetchType) => void
    triggers: TriggerType[]
}

const FilterTexts: FilterTextsType = {
    DATE: { 1: 'Newest first', 2: 'Oldest first' },
    ANSWER: { 1: 'Answered', 2: 'Unanswered' },
    WATCHED: { 1: 'Most Watched', 2: 'Least Watched' },
    POPULAR: { 1: 'Most Popular', 2: 'Least Popular' },
}

const DropdownFilters = ({ refetch, triggers }: Props): JSX.Element => {
    const [selectedDateFilter, setSelectedDateFilter] = useState(FilterTexts.DATE[1])
    const [selectedAnswerFilter, setSelectedAnswerFilter] = useState(FilterTexts.ANSWER[1])
    const [selectedWatchedFilter, setSelectedWatchedFilter] = useState(FilterTexts.WATCHED[1])
    const [selectedPopularFilter, setSelectedPopularFilter] = useState(FilterTexts.POPULAR[1])

    const FilterLists: FilterListsType = {
        DATE: {
            state: selectedDateFilter,
            filters: [
                {
                    id: 1,
                    name: FilterTexts.DATE[1],
                    onClick: () => {
                        refetch({
                            first: 10,
                            page: 1,
                            orderBy: [{ column: 'CREATED_AT', order: 'DESC' }],
                        })
                        setSelectedDateFilter(FilterTexts.DATE[1])
                    },
                },
                {
                    id: 2,
                    name: FilterTexts.DATE[2],
                    onClick: () => {
                        refetch({
                            first: 10,
                            page: 1,
                            orderBy: [{ column: 'CREATED_AT', order: 'ASC' }],
                        })
                        setSelectedDateFilter(FilterTexts.DATE[2])
                    },
                },
            ],
        },
        ANSWER: {
            state: selectedAnswerFilter,
            filters: [
                {
                    id: 1,
                    name: FilterTexts.ANSWER[1],
                    onClick: () => {
                        refetch({ first: 10, page: 1, filter: 'answered' })
                        setSelectedAnswerFilter(FilterTexts.ANSWER[1])
                    },
                },
                {
                    id: 2,
                    name: FilterTexts.ANSWER[2],
                    onClick: () => {
                        refetch({ first: 10, page: 1, filter: 'unanswered' })
                        setSelectedAnswerFilter(FilterTexts.ANSWER[2])
                    },
                },
            ],
        },
        WATCHED: {
            state: selectedWatchedFilter,
            filters: [
                {
                    id: 1,
                    name: FilterTexts.WATCHED[1],
                    onClick: () => {
                        console.log(FilterTexts.WATCHED[1]) //Replace console log with refetch for watched
                        setSelectedWatchedFilter(FilterTexts.WATCHED[1])
                    },
                },
                {
                    id: 2,
                    name: FilterTexts.WATCHED[2],
                    onClick: () => {
                        console.log(FilterTexts.WATCHED[2]) //Replace console log with refetch for watched
                        setSelectedWatchedFilter(FilterTexts.WATCHED[2])
                    },
                },
            ],
        },
        POPULAR: {
            state: selectedPopularFilter,
            filters: [
                {
                    id: 1,
                    name: FilterTexts.POPULAR[1],
                    onClick: () => {
                        console.log(FilterTexts.POPULAR[1]) //Replace console log with refetch for poplarity
                        setSelectedPopularFilter(FilterTexts.POPULAR[1])
                    },
                },
                {
                    id: 2,
                    name: FilterTexts.POPULAR[2],
                    onClick: () => {
                        console.log(FilterTexts.POPULAR[2]) //Replace console log with refetch for poplarity
                        setSelectedPopularFilter(FilterTexts.POPULAR[2])
                    },
                },
            ],
        },
    }

    return (
        <div className="flex flex-row gap-2">
            {triggers.map((trigger, index) => {
                return (
                    <SortDropdown
                        key={index}
                        filters={FilterLists[trigger].filters}
                        selectedFilter={FilterLists[trigger].state}
                    />
                )
            })}
        </div>
    )
}

export default DropdownFilters