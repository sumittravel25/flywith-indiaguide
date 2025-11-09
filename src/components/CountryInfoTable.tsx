import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface CountryData {
  home_country: string;
  destination_country: string;
  capital_city: string;
  official_languages: string;
  currency: string;
  time_difference: string;
  popular_destinations: string;
  major_airports: string;
  visa_portal_link: string;
  visa_requirement: string;
  embassy_info: string;
  flight_options: string;
}

interface CountryInfoTableProps {
  country: CountryData;
}

export function CountryInfoTable({ country }: CountryInfoTableProps) {
  const [exchangeRates, setExchangeRates] = useState<Record<string, number> | null>(null);
  const [loadingRates, setLoadingRates] = useState(false);
  const [inrAmount, setInrAmount] = useState<string>("100");
  const singleRate = exchangeRates ? Object.entries(exchangeRates)[0] : null;

  useEffect(() => {
    const fetchExchangeRates = async () => {
      // Extract currency code from the currency string (e.g., "Afghan afghani (AFN)" -> "AFN")
      const currencyMatch = country.currency.match(/\(([A-Z]{3})\)/);
      if (!currencyMatch) return;

      const currencyCode = currencyMatch[1];
      setLoadingRates(true);

      try {
        const { data, error } = await supabase.functions.invoke('get-exchange-rates', {
          body: { currencyCode }
        });

        if (error) throw error;

        if (data?.rates) {
          const inrPerUnitOfCountry = data.rates.INR;
          if (typeof inrPerUnitOfCountry === 'number' && inrPerUnitOfCountry > 0) {
            const oneINRInCountry = 1 / inrPerUnitOfCountry;
            setExchangeRates({ [currencyCode]: oneINRInCountry });
          }
        }
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
      } finally {
        setLoadingRates(false);
      }
    };

    fetchExchangeRates();
  }, [country.currency]);

  const getVisaBadgeVariant = (visa: string) => {
    const lowerVisa = visa.toLowerCase();
    if (lowerVisa.includes("visa-free") || lowerVisa.includes("visa free")) {
      return "default";
    }
    if (lowerVisa.includes("visa on arrival") || lowerVisa.includes("evisa")) {
      return "secondary";
    }
    return "destructive";
  };

  const formatExchangeRate = (rate: number) => {
    return rate.toFixed(4);
  };

  const calculateConversion = () => {
    if (!singleRate || !inrAmount) return "0.00";
    const amount = parseFloat(inrAmount);
    if (isNaN(amount)) return "0.00";
    return (amount * singleRate[1]).toFixed(2);
  };

  // Extract currency name and code
  const currencyMatch = country.currency.match(/^(.*)\s*\(([A-Z]{3})\)$/);
  const currencyName = currencyMatch ? currencyMatch[1] : country.currency;
  const currencyCode = currencyMatch ? currencyMatch[2] : "";

  const tableData = [
    { label: "Capital City", value: country.capital_city },
    { label: "Official Languages", value: country.official_languages },
    { label: "Currency", value: country.currency },
    { label: "Time Difference from IST", value: country.time_difference },
    { label: "Popular Destinations", value: country.popular_destinations },
    { label: "Major International Airport(s)", value: country.major_airports },
    { 
      label: `Visa Requirement for ${country.home_country} Citizens`, 
      value: country.visa_requirement,
      isBadge: true 
    },
    { 
      label: "Visa Application Portal", 
      value: country.visa_portal_link,
      isLink: true 
    },
    { label: `${country.home_country} Embassy/Consulate`, value: country.embassy_info },
    { label: `Flight Options from ${country.home_country}`, value: country.flight_options },
  ];

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-3xl">{country.destination_country}</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/3 font-semibold">Category</TableHead>
              <TableHead className="font-semibold">Information</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.map((row, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{row.label}</TableCell>
                <TableCell>
                  {row.isBadge ? (
                    <Badge variant={getVisaBadgeVariant(row.value)}>
                      {row.value}
                    </Badge>
                  ) : (row as any).isLink && row.value ? (
                    <a 
                      href={row.value.startsWith('http') ? row.value : `https://${row.value}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {row.value}
                    </a>
                  ) : (
                    row.value
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {currencyCode && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4">Currency Converter</h3>
            {loadingRates ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : singleRate ? (
              <div className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="text-xs text-muted-foreground mb-2">Exchange Rate</div>
                  <div className="text-sm font-medium">
                    1 INR = {formatExchangeRate(singleRate[1])} {singleRate[0]}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Indian Rupees (INR)</label>
                    <Input
                      type="number"
                      value={inrAmount}
                      onChange={(e) => setInrAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="text-lg"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{currencyName} ({currencyCode})</label>
                    <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center text-lg font-semibold">
                      {calculateConversion()}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Exchange rates unavailable</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
