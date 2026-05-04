


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
    <section className="py-12 md:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 md:px-8 border-t border-border pt-12 md:pt-16">
        <h2 className="text-2xl md:text-3xl font-black text-center text-foreground mb-12 md:mb-16 uppercase tracking-tight">How it Works</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {steps.map((step, idx) => (
            <div key={idx} className="flex flex-col items-center text-center group">
              <div className={`w-24 h-24 ${step.color} rounded-3xl flex items-center justify-center text-5xl mb-6 shadow-sm border border-border/50 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                {step.icon}
              </div>
              <h3 className="text-xl font-extrabold text-foreground mb-3">{step.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-[280px]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
