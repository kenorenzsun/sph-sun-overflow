import Link from 'next/link'

type Props = {
    author?: string
    moment?: string
    slug?: string
}

const Author = ({ author, moment, slug = '' }: Props): JSX.Element => {
    return (
        <div className="flex flex-row items-center gap-1 text-xs">
            <Link href={`/users/${slug}`}>
                <span className="flex items-center text-primary-blue hover:text-blue-400">
                    {author}
                </span>
            </Link>
            <span className="text-neutral-disabled">{moment}</span>
        </div>
    )
}

export default Author
