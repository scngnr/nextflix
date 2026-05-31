import { ScrollArea } from "~/components/ui/scroll-area"

export default function ResultPage(): JSX.Element {
  return (
    <main className="mt-8 space-y-4">
      <h2 className="text-xl font-semibold">Abonelik ödemeleri devre dışı</h2>
      <ScrollArea className="rounded-md border p-4">
        <p>
          Bu dağıtımda ödeme entegrasyonu bulunmuyor. Abonelik ödemesi şu anda
          kullanılamıyor.
        </p>
      </ScrollArea>
    </main>
  )
}
