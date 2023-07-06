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

    if (!body.name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!body.value) {
      return new NextResponse("Value is required", { status: 400 });
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

    const size = await prismadb.size.create({
      data: {
        name: body.name,
        value: body.value,
        storeId: params.storeId,
      },
    });

    return NextResponse.json(size);
  } catch (error) {
    console.log("[SIZES_POST]", error);
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
    
      const size = await prismadb.size.findMany({
        where: {
            storeId: params.storeId,
        }
      });
  
      return NextResponse.json(size);
    } catch (error) {
      console.log("[SIZES_GET]", error);
      return new NextResponse("Internal error", { status: 500 });
    }
  }