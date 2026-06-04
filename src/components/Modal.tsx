"use client";

import * as React from "react";
import { X } from "lucide-react";
import { Button } from "./Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./Card";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        <Card className="flex flex-col max-h-[90vh]">
          <CardHeader className="flex flex-row items-center justify-between pb-2 flex-shrink-0">
            <CardTitle className="text-lg">{title}</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="overflow-y-auto flex-1">{children}</CardContent>
          {footer && <CardFooter className="flex-shrink-0">{footer}</CardFooter>}
        </Card>
      </div>
    </div>
  );
}
