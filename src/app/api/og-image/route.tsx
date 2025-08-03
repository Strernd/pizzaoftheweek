import { getRecipes } from "@/lib/recipes";
import { ImageResponse } from "next/og";

export async function GET() {
  const recipes = await getRecipes();
  const leftmostRecipe = recipes[0]; // First recipe (leftmost)

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "white",
          backgroundImage: `url(${leftmostRecipe.imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            padding: "40px",
            borderRadius: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "60px",
              fontWeight: "bold",
              color: "white",
              margin: "0 0 20px 0",
            }}
          >
            Pizza Of The Week
          </h1>
          <p
            style={{
              fontSize: "24px",
              color: "white",
              margin: "0",
            }}
          >
            Three new topping ideas every week
          </p>
        </div>
      </div>
    ),
    {
      width: 1000,
      height: 536,
    }
  );
}
