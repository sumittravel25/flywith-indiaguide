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

interface CountryData {
  country_name: string;
  capital_city: string;
  official_languages: string;
  currency: string;
  time_difference: string;
  popular_destinations: string;
  major_airports: string;
  visa_requirement: string;
  indian_embassy: string;
  flight_options: string;
}

interface CountryInfoTableProps {
  country: CountryData;
}

export function CountryInfoTable({ country }: CountryInfoTableProps) {
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

  const tableData = [
    { label: "Capital City", value: country.capital_city },
    { label: "Official Languages", value: country.official_languages },
    { label: "Currency", value: country.currency },
    { label: "Time Difference from IST", value: country.time_difference },
    { label: "Popular Destinations", value: country.popular_destinations },
    { label: "Major International Airport(s)", value: country.major_airports },
    { 
      label: "Visa Requirement for Indians", 
      value: country.visa_requirement,
      isBadge: true 
    },
    { label: "Indian Embassy/High Commission", value: country.indian_embassy },
    { label: "Flight Options from India", value: country.flight_options },
  ];

  return (
    <Card className="shadow-card">
      <CardHeader>
        <CardTitle className="text-3xl">{country.country_name}</CardTitle>
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
                  ) : (
                    row.value
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
