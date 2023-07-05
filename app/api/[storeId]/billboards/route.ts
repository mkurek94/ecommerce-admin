import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!body.label) {
      return new NextResponse("Label is required", { status: 400 });
    }

    if (!body.imageUrl) {
      return new NextResponse("ImageUrl is required", { status: 400 });
    }

    if(!params.storeId) {
        return new NextResponse("Store Id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
        where: {
            id: params.storeId,
            userId: userId,
        }
    })

    if(!storeByUserId) {
        return new NextResponse("Unauthorized", { status: 403 });
    }

    const billboard = await prismadb.billboard.create({
      data: {
        label: body.label,
        imageUrl: body.imageUrl,
        storeId: params.storeId,
      },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.log("[BILLBOARDS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
    _req: Request,
    { params }: { params: { storeId: string } }
  ) {
    try {
      if(!params.storeId) {
          return new NextResponse("Store Id is required", { status: 400 });
      }
    
      const billboards = await prismadb.billboard.findMany({
        where: {
            storeId: params.storeId,
        }
      });
  
      return NextResponse.json(billboards);
    } catch (error) {
      console.log("[BILLBOARDS_GET]", error);
      return new NextResponse("Internal error", { status: 500 });
    }
  }