export default function HomeLoading() {
  return (
    <div className="min-h-screen">
      {/* Hero 骨架 */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <div className="h-7 w-36 bg-muted rounded-full animate-pulse" />
            </div>
            <div className="flex justify-center mb-5">
              <div className="h-7 w-48 bg-muted rounded-full animate-pulse" />
            </div>
            <div className="space-y-3">
              <div className="h-14 w-3/4 mx-auto bg-muted rounded-lg animate-pulse" />
              <div className="h-14 w-1/2 mx-auto bg-muted rounded-lg animate-pulse" />
            </div>
            <div className="max-w-2xl mx-auto mt-6 space-y-2">
              <div className="h-5 w-full bg-muted rounded animate-pulse" />
              <div className="h-5 w-2/3 mx-auto bg-muted rounded animate-pulse" />
            </div>
            <div className="flex justify-center gap-4 mt-10">
              <div className="h-11 w-36 bg-muted rounded-lg animate-pulse" />
              <div className="h-11 w-28 bg-muted rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      {/* 统计骨架 */}
      <section className="border-y py-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center">
                <div className="h-9 w-24 mx-auto bg-muted rounded animate-pulse" />
                <div className="h-4 w-16 mx-auto mt-1.5 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 项目卡片骨架 */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between mb-8">
            <div>
              <div className="h-8 w-32 bg-muted rounded animate-pulse" />
              <div className="h-4 w-48 mt-1 bg-muted rounded animate-pulse" />
            </div>
            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border p-6">
                <div className="flex justify-between">
                  <div className="h-6 w-16 bg-muted rounded-full animate-pulse" />
                  <div className="h-6 w-12 bg-muted rounded-full animate-pulse" />
                </div>
                <div className="h-6 w-3/4 mt-3 bg-muted rounded animate-pulse" />
                <div className="h-4 w-full mt-2 bg-muted rounded animate-pulse" />
                <div className="flex justify-between mt-4">
                  <div className="h-5 w-24 bg-muted rounded animate-pulse" />
                  <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
