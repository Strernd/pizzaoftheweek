"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, InfoIcon } from "lucide-react"
import {
  getYeastAmountTwoStepFermentation,
  minTempC,
  maxTempC,
  minYeastPct,
  maxYeastPct,
} from "@/lib/fermentation-calculator"

export default function DoughCalculator() {
  // State for calculator inputs
  const [doughBalls, setDoughBalls] = useState(4)
  const [ballWeight, setBallWeight] = useState(250)
  const [waterPercentage, setWaterPercentage] = useState(65)
  const [saltPercentage, setSaltPercentage] = useState(3)
  const [roomProofHours, setRoomProofHours] = useState(4)
  const [roomTempC, setRoomTempC] = useState(22)
  const [coldProofEnabled, setColdProofEnabled] = useState(true)
  const [coldProofHours, setColdProofHours] = useState(24)
  const [coldTempC, setColdTempC] = useState(7)
  const [yeastType, setYeastType] = useState<"fresh" | "dry" | "instant">("fresh")

  // Calculated values
  const [totalFlour, setTotalFlour] = useState(0)
  const [totalWater, setTotalWater] = useState(0)
  const [totalSalt, setTotalSalt] = useState(0)
  const [totalYeast, setTotalYeast] = useState(0)
  const [totalWeight, setTotalWeight] = useState(0)

  // Error and warning states
  const [yeastError, setYeastError] = useState<string | null>(null)
  const [isExtrapolatedValue, setIsExtrapolatedValue] = useState(false)
  const [calculationWarning, setCalculationWarning] = useState<string | null>(null)

  // Calculate recipe whenever inputs change
  useEffect(() => {
    try {
      // Reset error and warning states
      setYeastError(null)
      setIsExtrapolatedValue(false)
      setCalculationWarning(null)

      // Step 1: Calculate total weight
      const targetTotalWeight = doughBalls * ballWeight

      // Step 2: Calculate total percentage from baker's percentages
      const totalPercentage = 100 + waterPercentage + saltPercentage

      // Step 3: Calculate share of ingredients
      const flourWeight = Math.round((100 / totalPercentage) * targetTotalWeight)
      const waterWeight = Math.round((waterPercentage / totalPercentage) * targetTotalWeight)
      const saltWeight = Math.round((saltPercentage / totalPercentage) * targetTotalWeight)

      // Step 4: Calculate yeast percentage using the fermentation model
      let yeastPct = 0
      let yeastWeight = 0

      try {
        // Validate temperature ranges
        if (roomTempC < minTempC || roomTempC > maxTempC) {
          throw new Error(`Room temperature must be between ${minTempC}°C and ${maxTempC}°C`)
        }

        if (coldProofEnabled && (coldTempC < minTempC || coldTempC > maxTempC)) {
          throw new Error(`Cold temperature must be between ${minTempC}°C and ${maxTempC}°C`)
        }

        // Calculate yeast percentage
        yeastPct = getYeastAmountTwoStepFermentation(
          coldProofEnabled ? coldTempC : 0,
          coldProofEnabled ? coldProofHours : 0,
          roomTempC,
          roomProofHours,
        )

        // Check if the result is extrapolated
        if (yeastPct < minYeastPct || yeastPct > maxYeastPct) {
          setIsExtrapolatedValue(true)
          setCalculationWarning(
            `The calculated yeast percentage (${yeastPct.toFixed(3)}%) is outside the recommended range (${minYeastPct}% to ${maxYeastPct}%).`,
          )
        }

        // Apply yeast type conversion factors
        if (yeastType === "dry") {
          yeastPct *= 0.42 // Active dry yeast factor
        } else if (yeastType === "instant") {
          yeastPct *= 0.32 // Instant dry yeast factor
        }

        // Calculate yeast weight based on the percentage of flour
        yeastWeight = Math.round(flourWeight * (yeastPct / 100) * 10) / 10
      } catch (error) {
        // Handle specific errors from the fermentation calculation
        if (error instanceof Error) {
          // Check for specific error messages and provide more user-friendly guidance
          if (error.message === "Temperature too low or duration too short") {
            setYeastError(
              "The fermentation conditions require too much yeast. Try increasing the temperature or extending the fermentation time.",
            )
          } else if (error.message.includes("Cold fermentation time too low")) {
            setYeastError(
              "Cold fermentation time is too short for the given temperature. Try increasing the cold proof time or temperature.",
            )
          } else if (error.message.includes("Hours is too low")) {
            setYeastError("Fermentation time is too short. Please increase the room temperature proof time.")
          } else if (error.message.includes("Yeast amount is too low")) {
            setYeastError(
              "The calculated yeast amount is too low. Try decreasing the fermentation time or temperature.",
            )
          } else {
            setYeastError(error.message)
          }
        } else {
          setYeastError("Failed to calculate yeast amount")
        }

        // Use a fallback value for yeast
        yeastPct = 0.5
        if (yeastType === "dry") yeastPct *= 0.42
        if (yeastType === "instant") yeastPct *= 0.32
        yeastWeight = Math.round(flourWeight * (yeastPct / 100) * 10) / 10
      }

      // Step 5: Adjust other ingredients to account for yeast weight
      // Calculate how much we need to reduce other ingredients to maintain total weight
      const reductionFactor = yeastWeight / targetTotalWeight

      // Reduce each ingredient proportionally
      const adjustedFlourWeight = Math.round(flourWeight * (1 - reductionFactor))
      const adjustedWaterWeight = Math.round(waterWeight * (1 - reductionFactor))
      const adjustedSaltWeight = Math.round(saltWeight * (1 - reductionFactor))

      // Calculate actual total with adjusted values
      const actualTotal = adjustedFlourWeight + adjustedWaterWeight + adjustedSaltWeight + yeastWeight

      // Make final adjustment to flour if needed to match target weight exactly
      let finalFlourWeight = adjustedFlourWeight
      if (actualTotal !== targetTotalWeight) {
        finalFlourWeight += targetTotalWeight - actualTotal
      }

      // Check for NaN values before updating state
      if (isNaN(finalFlourWeight) || isNaN(adjustedWaterWeight) || isNaN(adjustedSaltWeight) || isNaN(yeastWeight)) {
        throw new Error("Invalid calculation results")
      }

      // Update state with calculated values
      setTotalFlour(finalFlourWeight)
      setTotalWater(adjustedWaterWeight)
      setTotalSalt(adjustedSaltWeight)
      setTotalYeast(yeastWeight)
      setTotalWeight(finalFlourWeight + adjustedWaterWeight + adjustedSaltWeight + yeastWeight)
    } catch (error) {
      // If there's a general calculation error, set reasonable defaults
      const targetTotalWeight = doughBalls * ballWeight
      const totalPercentage = 100 + waterPercentage + saltPercentage

      // Use a simplified calculation for fallback values
      const flourWeight = Math.round((100 / totalPercentage) * targetTotalWeight * 0.98) // 98% to leave room for yeast
      const waterWeight = Math.round((waterPercentage / totalPercentage) * targetTotalWeight * 0.98)
      const saltWeight = Math.round((saltPercentage / totalPercentage) * targetTotalWeight * 0.98)
      const yeastWeight = targetTotalWeight - flourWeight - waterWeight - saltWeight

      setTotalFlour(flourWeight)
      setTotalWater(waterWeight)
      setTotalSalt(saltWeight)
      setTotalYeast(yeastWeight)
      setTotalWeight(targetTotalWeight)

      // Set error message
      if (error instanceof Error) {
        setYeastError(`Calculation error: ${error.message}`)
      } else {
        setYeastError("An unknown error occurred during calculation")
      }
    }
  }, [
    doughBalls,
    ballWeight,
    waterPercentage,
    saltPercentage,
    roomProofHours,
    roomTempC,
    coldProofEnabled,
    coldProofHours,
    coldTempC,
    yeastType,
  ])

  // Helper function for number input with plus/minus buttons
  const NumberInput = ({
    value,
    onChange,
    min,
    max,
    step = 1,
    unit = "",
    label,
    disabled = false,
  }: {
    value: number
    onChange: (val: number) => void
    min: number
    max: number
    step?: number
    unit?: string
    label: string
    disabled?: boolean
  }) => (
    <div className="mb-6">
      <div className="flex items-center mb-2">
        <label className="text-gray-700 dark:text-gray-300 font-medium">{label}</label>
      </div>
      <div
        className={`flex rounded-md overflow-hidden border border-gray-300 dark:border-gray-700 ${
          disabled ? "opacity-50" : ""
        }`}
      >
        <Button
          variant="ghost"
          className="rounded-none px-4 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white"
          onClick={() => onChange(Math.max(min, value - step))}
          disabled={disabled}
        >
          -
        </Button>
        <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-800 px-4 py-2 text-center">
          {value}
          {unit}
        </div>
        <Button
          variant="ghost"
          className="rounded-none px-4 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white"
          onClick={() => onChange(Math.min(max, value + step))}
          disabled={disabled}
        >
          +
        </Button>
      </div>
    </div>
  )

  // Helper function for percentage input with plus/minus buttons
  const PercentageInput = ({
    value,
    onChange,
    min,
    max,
    step = 1,
    label,
  }: {
    value: number
    onChange: (val: number) => void
    min: number
    max: number
    step?: number
    label: string
  }) => (
    <div className="mb-6">
      <div className="flex items-center mb-2">
        <label className="text-gray-700 dark:text-gray-300 font-medium">{label}</label>
      </div>
      <div className="flex rounded-md overflow-hidden border border-gray-300 dark:border-gray-700">
        <Button
          variant="ghost"
          className="rounded-none px-4 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white"
          onClick={() => onChange(Math.max(min, value - step))}
        >
          -
        </Button>
        <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-800 px-4 py-2 text-center">
          {value}%
        </div>
        <Button
          variant="ghost"
          className="rounded-none px-4 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white"
          onClick={() => onChange(Math.min(max, value + step))}
        >
          +
        </Button>
      </div>
    </div>
  )

  // Safe display function to prevent NaN
  const safeDisplay = (value: number, decimals = 0) => {
    if (isNaN(value)) return "0"
    return decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString()
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <NumberInput label="Number of Dough Balls" value={doughBalls} onChange={setDoughBalls} min={1} max={20} />

        <NumberInput
          label="Dough Ball Weight"
          value={ballWeight}
          onChange={setBallWeight}
          min={150}
          max={400}
          step={5}
          unit="g"
        />
      </div>

      <div className="mb-8">
        <PercentageInput label="Water" value={waterPercentage} onChange={setWaterPercentage} min={50} max={90} />

        <PercentageInput label="Salt" value={saltPercentage} onChange={setSaltPercentage} min={1} max={6} step={0.1} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Room Temperature Proof</h3>
          <NumberInput label="Hours" value={roomProofHours} onChange={setRoomProofHours} min={1} max={24} />

          <NumberInput
            label="Temperature"
            value={roomTempC}
            onChange={setRoomTempC}
            min={Math.max(1, minTempC)}
            max={Math.min(34, maxTempC)}
            unit="°C"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Cold Proof (Refrigerator)</h3>
            <div className="flex items-center space-x-2">
              <Switch id="cold-proof" checked={coldProofEnabled} onCheckedChange={setColdProofEnabled} />
              <Label htmlFor="cold-proof" className="text-sm text-gray-600 dark:text-gray-400">
                Enable
              </Label>
            </div>
          </div>

          <NumberInput
            label="Hours"
            value={coldProofHours}
            onChange={setColdProofHours}
            min={0}
            max={48}
            disabled={!coldProofEnabled}
          />

          <NumberInput
            label="Temperature"
            value={coldTempC}
            onChange={setColdTempC}
            min={Math.max(1, minTempC)}
            max={Math.min(20, maxTempC)}
            unit="°C"
            disabled={!coldProofEnabled}
          />
        </div>
      </div>

      {yeastError && (
        <Alert variant="destructive" className="mb-6 border-red-500 dark:border-red-400 bg-red-50 dark:bg-red-950">
          <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-300" />
          <AlertDescription className="font-medium text-red-600 dark:text-red-300">{yeastError}</AlertDescription>
        </Alert>
      )}

      {calculationWarning && !yeastError && (
        <Alert className="mb-6 bg-amber-50 dark:bg-yellow-900 border-amber-300 dark:border-yellow-500">
          <InfoIcon className="h-4 w-4 text-amber-600 dark:text-yellow-300" />
          <AlertDescription className="text-amber-600 dark:text-yellow-300 font-medium">
            {calculationWarning}
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-8">
        <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Yeast Type</label>
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={yeastType === "fresh" ? "default" : "outline"}
            onClick={() => setYeastType("fresh")}
            className={yeastType === "fresh" ? "bg-red-500 hover:bg-red-600" : ""}
          >
            Fresh
          </Button>
          <Button
            variant={yeastType === "dry" ? "default" : "outline"}
            onClick={() => setYeastType("dry")}
            className={yeastType === "dry" ? "bg-red-500 hover:bg-red-600" : ""}
          >
            Active Dry
          </Button>
          <Button
            variant={yeastType === "instant" ? "default" : "outline"}
            onClick={() => setYeastType("instant")}
            className={yeastType === "instant" ? "bg-red-500 hover:bg-red-600" : ""}
          >
            Instant Dry
          </Button>
        </div>
      </div>

      <Card className="p-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-6 text-center">Dough Recipe</h2>

        <div className="text-center mb-6">
          <div className="text-xl font-medium text-red-600 dark:text-red-400">
            Total Dough Weight: {safeDisplay(totalWeight)}g
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-red-500 dark:bg-red-600 text-white p-4 rounded-lg text-center">
            <div className="text-sm uppercase tracking-wide mb-1">Flour</div>
            <div className="text-2xl font-bold">{safeDisplay(totalFlour)}g</div>
          </div>

          <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-4 rounded-lg text-center border border-gray-200 dark:border-gray-700">
            <div className="text-sm uppercase tracking-wide mb-1">Water</div>
            <div className="text-2xl font-bold">{safeDisplay(totalWater)}g</div>
          </div>

          <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-4 rounded-lg text-center border border-gray-200 dark:border-gray-700">
            <div className="text-sm uppercase tracking-wide mb-1">Salt</div>
            <div className="text-2xl font-bold">{safeDisplay(totalSalt)}g</div>
          </div>

          <div className="bg-red-500 dark:bg-red-600 text-white p-4 rounded-lg text-center">
            <div className="text-sm uppercase tracking-wide mb-1">Yeast</div>
            <div className="text-2xl font-bold">{safeDisplay(totalYeast, 1)}g</div>
          </div>
        </div>
      </Card>

      <div className="mt-4 text-center text-gray-600 dark:text-gray-400 text-sm">
        The yeast amount is based on TXCraig1s yeast chart.
      </div>
    </div>
  )
}
