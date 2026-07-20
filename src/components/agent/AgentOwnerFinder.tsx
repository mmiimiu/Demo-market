"use client";

import React, { useState } from 'react';
import { Search, MapPin, Building2, User, Key, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export function AgentOwnerFinder({ lang }: { lang: 'th' | 'en' | 'cn' }) {
  const isThai = lang === 'th';
  const isChinese = lang === 'cn';
  const isEnglish = lang === 'en';
  const [query, setQuery] = useState('');

  const mockOwners = [
    { 
      id: 1, 
      titleTh: 'Aspire Sukhumvit 48', titleEn: 'Aspire Sukhumvit 48', titleCn: 'Aspire Sukhumvit 48',
      price: 15000, 
      typeTh: 'Condo', typeEn: 'Condo', typeCn: '公寓',
      statusTh: 'พร้อมรับเอเจ้นท์', statusEn: 'Ready for Agent', statusCn: '可接洽经纪人',
    },
    { 
      id: 2, 
      titleTh: 'Life Ladprao Valley', titleEn: 'Life Ladprao Valley', titleCn: 'Life Ladprao Valley',
      price: 18000, 
      typeTh: 'Condo', typeEn: 'Condo', typeCn: '公寓',
      statusTh: 'คอมมิชชั่น 1 เดือน', statusEn: 'Commission 1 Month', statusCn: '1个月佣金',
    },
    { 
      id: 3, 
      titleTh: 'Modern House Ramintra', titleEn: 'Modern House Ramintra', titleCn: 'Modern House Ramintra',
      price: 35000, 
      typeTh: 'House', typeEn: 'House', typeCn: '别墅',
      statusTh: 'พร้อมรับเอเจ้นท์', statusEn: 'Ready for Agent', statusCn: '可接洽经纪人',
    },
  ];

  return (
    <div className={cn(
      "max-w-5xl mx-auto p-6 lg:p-10 space-y-8",
      isChinese ? "font-chinese" : isThai ? "font-thai" : "font-english"
    )}>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-1">
            {isChinese ? '经纪人寻找业主' : isThai ? 'Agent Finding Owner' : 'Agent Finding Owner'}
          </h1>
          <p className="text-muted-foreground font-medium">
            {isChinese ? '寻找开放经纪人代理的房产。' : isThai ? 'ค้นหาห้องที่เจ้าของเปิดให้ Agent ช่วยดูแล' : 'Find properties open for agent representation.'}
          </p>
        </div>
        <div className="bg-orange-50 p-4 rounded-none border border-orange-100 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-orange-500" />
          <p className="text-sm font-bold text-orange-700">
            {isChinese ? '今日新增 125 条房源' : isThai ? 'พบ 125 ประกาศใหม่วันนี้' : '125 new listings today'}
          </p>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute inset-y-0 left-5 flex items-center">
          <Search className="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
        </div>
        <Input 
          className="h-16 pl-14 pr-40 rounded-none border-none shadow-xl text-lg font-bold"
          placeholder={isChinese ? '搜索项目หรือ区域...' : isThai ? 'ค้นหาโครงการ หรือ ย่านที่ต้องการ...' : 'Search projects or areas...'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <Button className="absolute right-2 top-2 bottom-2 px-8 rounded-none bg-primary hover:bg-primary-dark font-black">
          {isChinese ? '搜索' : isThai ? 'ค้นหา' : 'Search'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockOwners.map((item) => {
          // Logic for title display
          const displayTitle = isEnglish 
            ? item.titleEn 
            : isChinese 
              ? `${item.titleCn} (${item.titleEn})`
              : `${item.titleTh} (${item.titleEn})`;

          return (
            <Card key={item.id} className="border-none shadow-sm rounded-none overflow-hidden group hover:shadow-xl transition-all duration-300">
              <div className="aspect-[16/10] bg-gray-100 relative overflow-hidden">
                <img src={`https://picsum.photos/seed/${item.id}/600/400`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                <Badge className="absolute top-4 left-4 bg-green-500 text-white border-none font-black rounded-none">
                  {isChinese ? item.statusCn : isThai ? item.statusTh : item.statusEn}
                </Badge>
              </div>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest mb-2">
                  <Building2 className="w-3.5 h-3.5" />
                  {isChinese ? item.typeCn : isThai ? item.typeTh : item.typeEn}
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-1 line-clamp-2">
                  {displayTitle}
                </h3>
                <p className="text-2xl font-black text-primary mb-4">฿{item.price.toLocaleString()}</p>
                
                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gray-50 rounded-none flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className="text-sm font-bold text-gray-600">
                      {isChinese ? '业主' : isThai ? 'เจ้าของ' : 'Owner'}
                    </span>
                  </div>
                  <Button variant="outline" className="rounded-none border-primary text-primary font-black h-10 px-6">
                    {isChinese ? '联系' : isThai ? 'ดูเบอร์โทร' : 'Contact'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
