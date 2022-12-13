import styles from "../../../styles/SignIn.module.css"
import { getProviders } from "next-auth/react"
import SignInButton from "../../../components/SignInButton";
import {authOptions} from "../../../pages/api/auth/[...nextAuth]"

async function SignIn() {
    const providers = authOptions.providers;
    // TODO: redirect to home page if already logged in
    // do this when advanced routing is implemented
  return (
    <main className={styles.main}>
        {Object.values(providers!).map(provider=>{
            return <div key={provider.id} className={styles.provider}>
                <h3>Sign In with {provider.name} <img className={styles.logo} src="/google.png" alt="google logo" /></h3>
                <SignInButton className={styles.authbtn} provider={provider}/>
            </div>
        })}
    </main>
  )
}


export default SignIn
