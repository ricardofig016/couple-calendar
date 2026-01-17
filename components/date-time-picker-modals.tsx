import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import React from "react";

interface DateTimePickerModalsProps {
  showDatePicker: boolean;
  setShowDatePicker: (show: boolean) => void;
  date: Date;
  setDate: (date: Date) => void;

  showStartTimePicker: boolean;
  setShowStartTimePicker: (show: boolean) => void;
  startTime: Date;
  setStartTime: (date: Date) => void;

  showEndTimePicker: boolean;
  setShowEndTimePicker: (show: boolean) => void;
  endTime: Date;
  setEndTime: (date: Date) => void;

  showMultiStartDatePicker: boolean;
  setShowMultiStartDatePicker: (show: boolean) => void;
  multiStartDate: Date;
  setMultiStartDate: (date: Date) => void;

  showMultiStartTimePicker: boolean;
  setShowMultiStartTimePicker: (show: boolean) => void;
  setMultiStartTime: (date: Date) => void;

  showMultiEndDatePicker: boolean;
  setShowMultiEndDatePicker: (show: boolean) => void;
  multiEndDate: Date;
  setMultiEndDate: (date: Date) => void;

  showMultiEndTimePicker: boolean;
  setShowMultiEndTimePicker: (show: boolean) => void;
  setMultiEndTime: (date: Date) => void;
}

export function DateTimePickerModals(props: DateTimePickerModalsProps) {
  const {
    showDatePicker,
    setShowDatePicker,
    date,
    setDate,
    showStartTimePicker,
    setShowStartTimePicker,
    startTime,
    setStartTime,
    showEndTimePicker,
    setShowEndTimePicker,
    endTime,
    setEndTime,
    showMultiStartDatePicker,
    setShowMultiStartDatePicker,
    multiStartDate,
    setMultiStartDate,
    showMultiStartTimePicker,
    setShowMultiStartTimePicker,
    setMultiStartTime,
    showMultiEndDatePicker,
    setShowMultiEndDatePicker,
    multiEndDate,
    setMultiEndDate,
    showMultiEndTimePicker,
    setShowMultiEndTimePicker,
    setMultiEndTime,
  } = props;

  return (
    <>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
            setShowDatePicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      {showStartTimePicker && (
        <DateTimePicker
          value={startTime}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={(event: DateTimePickerEvent, selectedTime?: Date) => {
            setShowStartTimePicker(false);
            if (selectedTime) setStartTime(selectedTime);
          }}
        />
      )}

      {showEndTimePicker && (
        <DateTimePicker
          value={endTime}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={(event: DateTimePickerEvent, selectedTime?: Date) => {
            setShowEndTimePicker(false);
            if (selectedTime) setEndTime(selectedTime);
          }}
        />
      )}

      {showMultiStartDatePicker && (
        <DateTimePicker
          value={multiStartDate}
          mode="date"
          display="default"
          onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
            setShowMultiStartDatePicker(false);
            if (selectedDate) {
              const newDate = new Date(selectedDate);
              newDate.setHours(multiStartDate.getHours(), multiStartDate.getMinutes());
              setMultiStartDate(newDate);
            }
          }}
        />
      )}

      {showMultiStartTimePicker && (
        <DateTimePicker
          value={multiStartDate}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={(event: DateTimePickerEvent, selectedTime?: Date) => {
            setShowMultiStartTimePicker(false);
            if (selectedTime) {
              setMultiStartTime(selectedTime);
            }
          }}
        />
      )}

      {showMultiEndDatePicker && (
        <DateTimePicker
          value={multiEndDate}
          mode="date"
          display="default"
          onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
            setShowMultiEndDatePicker(false);
            if (selectedDate) {
              const newDate = new Date(selectedDate);
              newDate.setHours(multiEndDate.getHours(), multiEndDate.getMinutes());
              setMultiEndDate(newDate);
            }
          }}
        />
      )}

      {showMultiEndTimePicker && (
        <DateTimePicker
          value={multiEndDate}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={(event: DateTimePickerEvent, selectedTime?: Date) => {
            setShowMultiEndTimePicker(false);
            if (selectedTime) {
              setMultiEndTime(selectedTime);
            }
          }}
        />
      )}
    </>
  );
}
