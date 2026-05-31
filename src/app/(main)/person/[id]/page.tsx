import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { getPersonDetail } from "~/lib/server-fetchers"

export async function generateMetadata(props: {
  params: { id: string }
}): Promise<Metadata> {
  const person = await getPersonDetail(Number(props.params.id))
  if (!person) return { title: "Kişi bulunamadı | Nextflix" }
  return {
    title: `${person.name} | Nextflix`,
    description:
      person.biography?.slice(0, 160) ||
      `${person.name} sahne aldığı yapımlar.`,
    openGraph: person.profile_path
      ? {
          images: [`https://image.tmdb.org/t/p/w500${person.profile_path}`],
        }
      : undefined,
  }
}

function age(birthday: string | null, deathday: string | null) {
  if (!birthday) return null
  const end = deathday ? new Date(deathday) : new Date()
  const start = new Date(birthday)
  let years = end.getFullYear() - start.getFullYear()
  const m = end.getMonth() - start.getMonth()
  if (m < 0 || (m === 0 && end.getDate() < start.getDate())) years--
  return years
}

export default async function PersonPage(props: { params: { id: string } }) {
  const person = await getPersonDetail(Number(props.params.id))
  if (!person) notFound()

  const years = age(person.birthday, person.deathday)

  return (
    <main className="px-4 pb-16 pt-24 md:px-12">
      <div className="flex flex-col gap-6 md:flex-row md:gap-10">
        <div className="mx-auto w-40 shrink-0 md:mx-0 md:w-60">
          <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg bg-neutral-800">
            {person.profile_path ? (
              <Image
                src={`https://image.tmdb.org/t/p/w500${person.profile_path}`}
                alt={person.name}
                fill
                sizes="(max-width: 768px) 160px, 240px"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-5xl font-bold text-white/30">
                {person.name.charAt(0)}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <h1 className="text-3xl font-bold text-white md:text-5xl">
            {person.name}
          </h1>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/70">
            {person.known_for_department && (
              <span>{person.known_for_department}</span>
            )}
            {person.birthday && (
              <span>
                {new Date(person.birthday).toLocaleDateString("tr-TR")}
                {years != null && ` (${years} yaşında)`}
              </span>
            )}
            {person.place_of_birth && <span>{person.place_of_birth}</span>}
          </div>
          {person.biography && (
            <p className="max-w-3xl whitespace-pre-line text-sm leading-relaxed text-white/85 md:text-base">
              {person.biography}
            </p>
          )}
        </div>
      </div>

      {person.credits.length > 0 && (
        <section className="mt-12">
          <h2 className="mb-4 text-xl font-semibold text-white md:text-2xl">
            Sahne Aldığı Yapımlar
          </h2>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {person.credits.slice(0, 24).map((c) => (
              <Link
                key={`${c.mediaType}-${c.id}`}
                href={`/show/${c.id}?mediaType=${c.mediaType}`}
                scroll={false}
                className="group space-y-1.5"
              >
                <div className="relative aspect-[2/3] w-full overflow-hidden rounded-md bg-neutral-800 transition group-hover:brightness-110">
                  {(c.poster_path ?? c.backdrop_path) && (
                    <Image
                      src={`https://image.tmdb.org/t/p/w342${
                        c.poster_path ?? c.backdrop_path
                      }`}
                      alt={c.title}
                      fill
                      sizes="(max-width: 768px) 33vw, 12vw"
                      className="object-cover"
                    />
                  )}
                </div>
                <p className="line-clamp-1 text-xs font-medium text-white">
                  {c.title}
                </p>
                {c.character && (
                  <p className="line-clamp-1 text-[11px] text-white/50">
                    {c.character}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
