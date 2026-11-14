import type { MetadataRoute } from "next";

// 房间号和大屏入场页不该被搜索引擎收录
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/squad/", "/event/join", "/api/"],
      },
    ],
  };
}
