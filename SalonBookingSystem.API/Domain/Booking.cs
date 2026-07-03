namespace SalonBookingSystem.API.Domain;

public class Booking
{
    public int Id { get; set; }
    public int ClientId { get; set; }
    public int ServiceId { get; set; }
    public int? StylistId { get; set; }
    public DateTime BookingDateTime { get; set; }
    public BookingStatus Status { get; set; } = BookingStatus.Pending;
    public string Notes { get; set; } = string.Empty;
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.OnSite;
    public bool IsPaid { get; set; } = false;
    public string StripePaymentIntentId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public User? Client { get; set; }
    public Service? Service { get; set; }
    public User? Stylist { get; set; }
    public Payment? Payment { get; set; }
}

public enum BookingStatus
{
    Pending,
    Confirmed,
    Completed,
    Cancelled,
    NoShow
}

public enum PaymentMethod
{
    OnSite,
    Stripe,
    Card,
    Cash
}
