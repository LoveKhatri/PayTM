import axios from "axios"
import { Appbar } from "../components/Appbar"
import { Balance } from "../components/Balance"
import { Users } from "../components/Users"
import { useState } from "react"

export const Dashboard = async () => {

    const [balance, setBalance] = useState("0")

    const bal = await axios.get("http://127.0.0.1:3000/api/v1/account/balance", {
        headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    })
    console.log(bal)
    setBalance(bal.data.balance)

    return <div>
        <Appbar />
        <div className="m-8">
            <Balance value={balance} />
            <Users />
        </div>
    </div>
}