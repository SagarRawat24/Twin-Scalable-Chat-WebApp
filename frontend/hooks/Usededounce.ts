import { useEffect, useState } from "react"

export function useDebounce<T>(value: T, delay: number = 700) {
    // define the state var

    const [debounce, setdebounce] = useState(value)


    //implement use effect 

    useEffect(() => {

        // implementing timer 

        const timer = setTimeout(() => {

            setdebounce(value)

        }, delay)

        // clearing the timer if user type before or between timer 

        return () => clearTimeout(timer)
        

    }, [value, delay])

    // return 

    return debounce

}