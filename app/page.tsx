import { Footer } from '@/components/footer'
import { ThemeToggle } from '@/components/theme-toggle'
import FileConverter from '@/components/file-converter'

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <div className="container mx-auto px-8 md:px-16 py-16 flex-1 flex flex-col">
        <nav className="flex justify-end items-center">
          <ThemeToggle />
        </nav>
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 max-w-2xl">
          <h1 className="font-poppins font-extrabold leading-tight tracking-tighter space-y-2 text-xl sm:text-2xl md:text-3xl lg:text-4xl">
            ConvertiQ
          </h1>
          <p className="text-xs sm:text-xs md:text-sm lg:text-base text-muted-foreground max-w-2xl">
            Upload your file and we&apos;ll detect what it is and show you
            conversion options
          </p>
          <FileConverter />
        </div>
      </div>
      <Footer />
    </main>
  )
}
