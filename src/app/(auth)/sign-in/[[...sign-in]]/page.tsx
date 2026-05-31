import { SignIn } from "@clerk/nextjs"

const clerkAppearance = {
  variables: {
    colorPrimary: "#E50914",
    colorBackground: "rgba(0,0,0,0.75)",
    colorText: "#ffffff",
    colorInputBackground: "#333333",
    colorInputText: "#ffffff",
    borderRadius: "4px",
  },
  elements: {
    card: "bg-black/75 border border-white/10 shadow-2xl backdrop-blur-sm",
    headerTitle: "text-white",
    headerSubtitle: "text-white/70",
    socialButtonsBlockButton: "bg-white/10 border-white/20 text-white hover:bg-white/20",
    formButtonPrimary: "bg-[#E50914] hover:bg-[#B20710] text-white",
    footerActionLink: "text-white hover:text-white/80",
  },
}

export default function Page() {
  return (
    <SignIn
      appearance={clerkAppearance}
      routing="path"
      path="/sign-in"
      signUpUrl="/sign-up"
    />
  )
}
