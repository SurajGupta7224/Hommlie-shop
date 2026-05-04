


const steps = [
  {
    title: 'Open the app',
    description: 'Choose from over 7000 products across groceries, fresh fruits & veggies, meat, pet care, beauty items & more',
    icon: '📱',
    color: 'bg-purple-50',
  },
  {
    title: 'Place an order',
    description: 'Add your favourite items to the cart & avail the best offers',
    icon: '🛒',
    color: 'bg-yellow-50',
  },
  {
    title: 'Get free delivery',
    description: 'Experience lighting-fast speed & get all your items delivered in minutes',
    icon: '⚡',
    color: 'bg-blue-50',
  },
];

export default function HowItWorks() {
  return (
    <section className="bg-background">
      <div className="max-w-7xl mx-auto border-t border-border pt-8">
        <h2 className="text-2xl md:text-3xl font-semibold text-center text-foreground mb-12 md:mb-16 uppercase tracking-tight">How it Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center text-center p-10 bg-white border border-border rounded-xl shadow-md transition-all duration-300 group hover:shadow-xl">
              <div className="text-6xl mb-8 transition-all duration-500 group-hover:scale-110">
                {step.icon}
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">{step.title}</h3>
              <p className="text-[13px] text-muted-foreground leading-relaxed font-medium">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
