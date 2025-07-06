import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/utils/helpers';
import { Filter, RotateCcw } from 'lucide-react';
import { GAME_MODES, CHARACTERS } from '@/utils/constants';

interface MatchFiltersProps {
  selectedMode: string;
  selectedCharacter: string;
  selectedResult: string;
  onModeChange: (mode: string) => void;
  onCharacterChange: (character: string) => void;
  onResultChange: (result: string) => void;
  onReset: () => void;
  className?: string;
}

export const MatchFilters: React.FC<MatchFiltersProps> = ({
  selectedMode,
  selectedCharacter,
  selectedResult,
  onModeChange,
  onCharacterChange,
  onResultChange,
  onReset,
  className
}) => {
  return (
    <div className={cn("flex flex-wrap items-center gap-3 p-4 bg-dakGray-50 rounded-lg", className)}>
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-dakGray-600" />
        <span className="text-sm font-medium text-dakGray-700">필터</span>
      </div>

      {/* 게임 모드 */}
      <Select value={selectedMode} onValueChange={onModeChange}>
        <SelectTrigger className="w-[120px] bg-white">
          <SelectValue placeholder="모든 모드" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">모든 모드</SelectItem>
          <SelectItem value="1">솔로</SelectItem>
          <SelectItem value="2">듀오</SelectItem>
          <SelectItem value="3">스쿼드</SelectItem>
        </SelectContent>
      </Select>

      {/* 실험체 */}
      <Select value={selectedCharacter} onValueChange={onCharacterChange}>
        <SelectTrigger className="w-[140px] bg-white">
          <SelectValue placeholder="모든 실험체" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">모든 실험체</SelectItem>
          {Object.entries(CHARACTERS).map(([code, character]) => (
            <SelectItem key={code} value={code}>
              {character.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 결과 */}
      <Select value={selectedResult} onValueChange={onResultChange}>
        <SelectTrigger className="w-[120px] bg-white">
          <SelectValue placeholder="모든 결과" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">모든 결과</SelectItem>
          <SelectItem value="win">승리 (1-3등)</SelectItem>
          <SelectItem value="lose">패배 (4등 이하)</SelectItem>
        </SelectContent>
      </Select>

      {/* 초기화 버튼 */}
      <Button
        variant="outline"
        size="sm"
        onClick={onReset}
        className="border-dakGray-200 hover:bg-white"
      >
        <RotateCcw className="h-3 w-3 mr-1" />
        초기화
      </Button>
    </div>
  );
} 